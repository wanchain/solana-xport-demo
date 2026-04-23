
use {

    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{transfer, Mint, Token, TokenAccount, Transfer},
    },
};

use anchor_lang::solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    instruction::{AccountMeta, Instruction},
    program::{ invoke,invoke_signed },
    pubkey::Pubkey,
};
use anchor_lang::{AnchorDeserialize, AnchorSerialize};

mod utils;
mod events;
mod constants;

use constants::*;

use utils::*;

pub mod message_data;

use message_data::*;
mod errors;

declare_id!("4mu1MKadzjZkwQ32H7DT2epqTtMmuEzJdwPEUFrPwvBc");

const USDC_PUBKEY:Pubkey = pubkey!("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");



#[program]
pub mod token_xport_demo {
    use anchor_lang::solana_program;
    use anchor_spl::associated_token::get_associated_token_address;
    use crate::errors::Errors;
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, gateway_program: Pubkey, peer_contract: [u8;20]) -> Result<()> {
        ctx.accounts.fundraiser.set_inner(Fundraiser {
        });
        let settings = &mut ctx.accounts.settings;
        settings.gateway_program = gateway_program.clone();
        settings.authority = ctx.accounts.maker.key();
        settings.peer_contract = peer_contract.clone();
        msg!("Settings initialized with gateway_program: {}, peer_contracrt: {:?}", gateway_program, peer_contract);
        Ok(())
    }

    pub fn update_gateway_program(ctx: Context<UpdateSettings>, new_gateway_program: Pubkey) -> Result<()> {
        let settings = &mut ctx.accounts.settings;
        settings.gateway_program = new_gateway_program;
        msg!("Updated gateway progress ID to: {}", new_gateway_program);
        Ok(())
    }
    pub fn update_peer_contract(ctx: Context<UpdateSettings>, peer_contract: [u8;20] )-> Result<()> {
        let settings = &mut ctx.accounts.settings;
        settings.peer_contract = peer_contract.clone();
        msg!("Updated peer contract address is : {:?}", peer_contract);

        Ok(())
    }

    pub fn update_authority(ctx: Context<UpdateSettings>, new_authority: Pubkey) -> Result<()> {
        let settings = &mut ctx.accounts.settings;
        settings.authority = new_authority;
        msg!("Updated authority to: {}", new_authority);
        Ok(())
    }

    pub fn out_bound_call<'info>(ctx:Context<'_,'_,'_,'info,LockAccounts<'info>>,  peer_chain_id:u128, peer_app_address:Vec<u8>, function_call_data:Vec<u8>, gas_limit: u64) -> Result<()> {
        msg!("out_bound_call of program: {:?}", ctx.program_id);

        let curr_app_address = ctx.program_id.to_bytes();

        let params = OutBoundParams{
            network_id: peer_chain_id,
            contract_address: peer_app_address.clone(),
            function_call_data,
            source_contract_address: curr_app_address,
            gas_fee: gas_limit
        };

        let mut ix_data = Vec::new();
        let r1 = constants::GATEWAY_OUTBOUND_CALL_IX_ID; // Gate-Way program outbound_call discriminator
        let r2 = params.try_to_vec().unwrap();

        ix_data.extend_from_slice(&r1);
        ix_data.extend_from_slice(&r2);

        // Provide the required accounts for gate-way's outbound_call
        // Order must match gate-way's OutboundCall context struct: nonce_account, signer, cpi_signer, config_account, system_program
        let accounts_meta = vec![
            AccountMeta::new(ctx.accounts.nonce_account.key(), false),     // nonce_account
            AccountMeta::new(ctx.accounts.sender.key(), true),             // signer (user who pays fees)
            AccountMeta::new_readonly(ctx.accounts.cpi_signer.key(), true), // cpi_signer (PDA signer, read-only)
            AccountMeta::new_readonly(ctx.accounts.config_account.key(), false), // config_account
            AccountMeta::new_readonly(ctx.accounts.system_program.key(), false), // system_program
        ];

        let gateway_program_id = ctx.accounts.settings.gateway_program.clone();

        let ix = &Instruction::new_with_bytes(
            ctx.accounts.gateway_program.key(),
            &ix_data,
            accounts_meta,
        );
        let account_infos = vec![
            ctx.accounts.nonce_account.to_account_info(),
            ctx.accounts.sender.to_account_info(),
            ctx.accounts.cpi_signer.to_account_info(),
            ctx.accounts.config_account.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ];

        // Use invoke_signed with PDA signer
        let bump = ctx.bumps.cpi_signer;
        let signer_seeds: &[&[&[u8]]] = &[&[SEEDS::CPI_SIGNER.as_bytes(), &[bump]]];
        invoke_signed(ix, &account_infos, signer_seeds)?;

        Ok(())
    }

    pub fn lock_token<'info>(ctx:Context<'_,'_,'_,'info,LockAccounts<'info>>, peer_chain_id:u128, peer_app_address:Vec<u8>,to:Vec<u8>, amount:u64, gas_limit: u64) -> Result<()> {
        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from:ctx.accounts.sender_token_account.to_account_info(),
                    to:ctx.accounts.vault.to_account_info(),
                    authority:ctx.accounts.sender.to_account_info(),
                },
            ),
            amount
        )?;
        let cross_message_data = message_data::MessageData {
            message_type:"cross_token".to_string(),
            from:ctx.accounts.sender.to_account_info().key().try_to_vec()?,
            to:to,
            amount:amount
        };

        let encoded_data =  message_data::encode_message_data(&cross_message_data);

        let func_call_data_obj = FunctionCallData {
            message_func: "wmbReceive".as_bytes().to_vec(),
            message_data: encoded_data,
        };

        let function_call_data = func_call_data_obj.try_to_vec()?;

        out_bound_call(ctx, peer_chain_id, peer_app_address, function_call_data, gas_limit)?;
        Ok(())
    }


    pub fn wmb_receive(ctx: Context<UnLockAccounts>, data: Vec<u8>) -> Result<()> {
        msg!("WmbReceive called with {} bytes", data.len());
        msg!("wmb_receive(2) of program: {:?}, data: {:?}", ctx.program_id, data);

        // Temporarily hardcoded Gate-Way program ID
        //let expected_gateway_program = Pubkey::from_str("9J17hVJXCcMsD1E7Kv5yNKEgQAhwcu4NvtPQvXkgesiV").unwrap();

        let expected_gateway_program = ctx.accounts.settings.gateway_program.clone();

        msg!("wmb_receive() expected_delegate_program is: {:?}", expected_gateway_program);

        verify_cpi_caller(&ctx.accounts.cpi_authority, expected_gateway_program, Errors::NotMatchWithCpiSigner)?;

        // First decode inbound payload as InBoundFunctionCallData (borsh)
        let inbound = InBoundFunctionCallData::try_from_slice(&data)?;

        // TODO: verify inbound.network_id and inbound.contract_address for safety. For example, check them if thm are in white-list.

        msg!("Inbound payload -> network_id: {:?}", inbound.network_id);
        msg!("Inbound payload -> contract_address len: {:?}", inbound.contract_address.len());
        msg!("Inbound payload -> contract_address: {:?}", inbound.contract_address.clone());

        let peer_contract_addr = ctx.accounts.settings.peer_contract.clone();
        if(inbound.contract_address != peer_contract_addr){
            msg!("inbound.contract_address {:?} != peer_contractg_addr{:?}", inbound.contract_address,peer_contract_addr );
            return  Err(Errors::ErrorPeerContract.into());
        }


        let function_call_data = FunctionCallData::try_from_slice(&inbound.func_call_data)?;

        // Then decode the inner func_call_data as ABI-encoded MessageData
        // Expected format: abi.encode((string, bytes, uint256))
        match decode_message_data(&function_call_data.message_data) {
            Ok(message_data) => {
                msg!("Successfully decoded message data:");

                match message_data.message_type.as_str() {
                    "unlockToken" => {
                        msg!("Processing Message from {:?}", message_data.from);
                        msg!("Processing Message to {:?}", message_data.to);
                        msg!("Processing Message amount {:?}", message_data.amount);

                        unlock_token(ctx, message_data.amount)?;

                    },
                    _=> {
                        msg!("Unknown message type: {}", message_data.message_type);
                    }
                }

            },
            Err(e) => {
                msg!("Failed to decode message data: {:?}", e);
                return Err(e);
            }
        }



        Ok(())
    }

    pub fn wmb_receive_accounts(ctx: Context<WmbReceiveAccountsContext>, data: Vec<u8>) -> Result<WmbReceiveAccountsResponse> {
        msg!("wmb_receive_accounts called with {} bytes", data.len());

        // Use hardcoded addresses from test_view_dynamic_accounts.js
        match decode_message_data(&data) {
            Ok(message_data) => {
                msg!("Successfully decoded message data:");
                let mut accounts = Vec::new();
                match message_data.message_type.as_str() {
                    "unlockToken" => {
                        msg!("Processing Message from {:?}", message_data.from);
                        msg!("Processing Message to {:?}", message_data.to.clone());
                        msg!("Processing Message amount {:?}", message_data.amount);

                        //let vec_to = Vec::try_from(message_data.to.clone()).unwrap();
                        let str_to = String::try_from(message_data.to.clone()).unwrap();
                        let receiver_token_account = Pubkey::try_from(str_to.as_str()).unwrap();

                        let (settingsPubkey, _) = Pubkey::find_program_address(&[b"settings"], ctx.program_id);
                        let (fundraiserPubkey,_) = Pubkey::find_program_address(&[b"fundraiser"], ctx.program_id);

                        let vault = get_associated_token_address(&fundraiserPubkey, &USDC_PUBKEY);

                        let TOKEN_PROGRAM_ID = Pubkey::try_from("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").map_err(|_| CustomError::InvalidAccountData)?;

                        let ASSOCIATED_TOKEN_PROGRAM_ID = Pubkey::try_from("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL").map_err(|_| CustomError::InvalidAccountData)?;

                        let SYSTEM_PROGRAM_ID = Pubkey::try_from("11111111111111111111111111111111").map_err(|_| CustomError::InvalidAccountData)?;


                        let tokenProgramID = AccountMetadata {
                            pubkey: TOKEN_PROGRAM_ID,
                            is_writable:false,
                            is_signer:false,
                        };

                        let associateTokenProgramID = AccountMetadata {
                            pubkey:ASSOCIATED_TOKEN_PROGRAM_ID,
                            is_writable:false,
                            is_signer:false,
                        };

                        let systemProgramID = AccountMetadata {
                            pubkey: SYSTEM_PROGRAM_ID,
                            is_writable:false,
                            is_signer:false
                        };

                        let usdcAccount = AccountMetadata {
                            pubkey:USDC_PUBKEY,
                            is_writable:false,
                            is_signer:false,
                        };


                        let settingAccount = AccountMetadata {
                            pubkey: settingsPubkey,
                            is_writable:false,
                            is_signer:false,
                        };
                        let fundraiserAccount = AccountMetadata {
                            pubkey:fundraiserPubkey,
                            is_writable:true,
                            is_signer:false,
                        };
                        let valutAccount = AccountMetadata {
                            pubkey:vault,
                            is_writable:true,
                            is_signer:false,
                        };
                        let receiveTokenAccount = AccountMetadata {
                            pubkey:receiver_token_account,
                            is_writable:true,
                            is_signer:false
                        };
                        accounts.push(settingAccount);
                        accounts.push(usdcAccount);
                        accounts.push(receiveTokenAccount);
                        accounts.push(fundraiserAccount);
                        accounts.push(valutAccount);



                        accounts.push(tokenProgramID);
                        accounts.push(associateTokenProgramID);
                        accounts.push(systemProgramID);


                        msg!("Returning {} hardcoded account metadata entries", accounts.len());

                        Ok(WmbReceiveAccountsResponse { accounts })


                    },
                    _=> {
                        msg!("Unknown message type: {}", message_data.message_type);
                        Ok(WmbReceiveAccountsResponse { accounts })

                    }
                }

            },
            Err(e) => {
                msg!("Failed to decode message data: {:?}", e);
                return Err(e);
            }
        }






    }

}

fn unlock_token(ctx:Context<UnLockAccounts>, amount:u64) -> Result<()> {
    let authority_seeds:&[&[&[u8]]] = &[&[b"fundraiser", &[ctx.bumps.fundraiser]]];

    let context = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from:ctx.accounts.vault.to_account_info(),
            to:ctx.accounts.receiver_token_account.to_account_info(),
            authority:ctx.accounts.fundraiser.to_account_info(),
        },
    ).with_signer(authority_seeds);

    transfer(context, amount);

    msg!("unlock_token, final-- from :{}, to: {}, amount: {}", ctx.accounts.vault.to_account_info().key(), ctx.accounts.receiver_token_account.to_account_info().key(), amount);
    Ok(())

}

#[account]
#[derive(InitSpace)]
pub struct Fundraiser {
}

pub const ANCHOR_DISCRIMINATOR: usize = 8;
#[derive(Accounts)]
pub struct Initialize<'info>{
    #[account(mut)]
    pub maker:Signer<'info>,
    #[account(
        address = USDC_PUBKEY,
    )]
    pub mint_account: Account<'info, Mint>,
    #[account(
        init,
        payer = maker,
        seeds = [b"fundraiser",],
        bump,
        space = ANCHOR_DISCRIMINATOR + Fundraiser::INIT_SPACE,
    )]
    pub fundraiser: Account<'info, Fundraiser>,
    #[account(
        init,
        payer = maker,
        associated_token::mint = mint_account,
        associated_token::authority = fundraiser,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
    init,
    payer = maker,
    space = 8+ 32 + 32 + 20,
    seeds = [b"settings"],
    bump
    )
    ]
    pub settings:Account<'info, Settings>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}


#[derive(Accounts)]
pub struct UpdateSettings<'info> {
    #[account(
        mut,
        seeds = [b"settings"],
        bump,
        has_one = authority  // Anchor reads settings.authority from the Settings account and Compares it with the authority account's public key in the context
    )]
    pub settings: Account<'info, Settings>,
    pub authority: Signer<'info>,
}



#[derive(Accounts)]
pub struct LockAccounts<'info> {

    pub sender: Signer<'info>,


    #[account(
        seeds = [b"settings"],
        bump
    )]
    pub settings: Account<'info, Settings>,

    /// PDA signer for CPI calls
    #[account(
        seeds = [ SEEDS::CPI_SIGNER.as_bytes() ],
        bump
    )]
    /// CHECK: gate-way program will check this
    pub cpi_signer: UncheckedAccount<'info>,

    /// CHECK: Gate-Way program that will be called via CPI
    pub gateway_program: UncheckedAccount<'info>,

    /// Nonce account for the gate-way program (will be derived)
    /// CHECK: This account is passed to gate-way program which will validate the PDA derivation
    #[account(mut)]
    pub nonce_account: UncheckedAccount<'info>,

    #[account(
        seeds=[ b"ConfigData"],
        seeds::program = "7jYCM8k5Nvwg5vyPpLk2yjivQhexPDMXuK8CSbUKqL6B".parse::<Pubkey>().unwrap(),
        bump
    )]
    /// CHECK: gw-app program will check this
    pub config_account: UncheckedAccount<'info>,


    #[account(
        address = USDC_PUBKEY,
    )]
    pub mint_account: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint_account,
        associated_token::authority = sender,
    )]
    pub sender_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
     constraint = vault.mint == mint_account.key(),
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnLockAccounts<'info> {
    /// CHECK: CPI Authority
    pub cpi_authority: Signer<'info>,  // parent program/ caller


    #[account(
        seeds = [b"settings"],
        bump
    )]
    pub settings: Account<'info, Settings>,

    #[account(
        address = USDC_PUBKEY,
    )]
    pub mint_account: Account<'info, Mint>,
    #[account(
        mut,
        constraint = receiver_token_account.mint == mint_account.key(),
    )]
    pub receiver_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"fundraiser",],
        bump,

    )]
    pub fundraiser: Account<'info, Fundraiser>,
    #[account(
        mut,
        associated_token::mint = mint_account,
        associated_token::authority = fundraiser,
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct WmbReceiveAccountsContext<'info> {
    #[account(
        seeds = [ SEEDS::AUXILIARY.as_bytes() ],
        bump
    )]
    /// CHECK: gw-app program will check this
    pub auxiliary_pda: UncheckedAccount<'info>,
}



#[repr(C)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct OutBoundParams {
    pub network_id:u128,
    pub contract_address: Vec<u8>,
    pub function_call_data: Vec<u8>,
    pub source_contract_address: [u8;32],
    pub gas_fee: u64
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct AccountMetadata {
    pub pubkey: Pubkey,
    pub is_writable: bool,
    pub is_signer: bool,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct WmbReceiveAccountsResponse {
    pub accounts: Vec<AccountMetadata>,
}

#[derive(AnchorDeserialize, AnchorSerialize, Debug, Clone)]
pub struct InBoundFunctionCallData {
    func_call_data: Vec<u8>,
    network_id: u128,  // peer chain id
    contract_address: Vec<u8>, // peer chain contract address, such as evm
}

#[derive(AnchorDeserialize, AnchorSerialize, Debug, Clone)]
pub struct FunctionCallData {
    pub message_func:Vec<u8>,  // Solana instruction discriminator (For anchor-based contract, it is 8 bytes); For evm, it is a string of dynamic length.
    pub message_data:Vec<u8>,
}

#[account]
pub struct Settings {
    pub gateway_program: Pubkey,
    pub authority: Pubkey,
    pub peer_contract: [u8;20],

}