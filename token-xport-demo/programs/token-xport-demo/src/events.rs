use anchor_lang::solana_program::pubkey::Pubkey;
use anchor_lang::prelude::*;


#[event]
pub struct AddToken {
    pub token_address: Pubkey,
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
}

#[event]
pub struct Transfer {
    pub from: Pubkey,
    pub to: Pubkey,
    pub value: u64,
}
