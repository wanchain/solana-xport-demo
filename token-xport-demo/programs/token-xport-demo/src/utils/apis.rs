use anchor_lang::prelude::*;  // for  msg! macro

use anchor_lang::solana_program::{
    pubkey::Pubkey,
    keccak,
    secp256k1_recover::{Secp256k1Pubkey, secp256k1_recover},
};

use super::data_types::*;
use crate::constants::*;
use crate::errors::Errors as ErrorCode;

use std::str::FromStr;


const SIGHASH_GLOBAL_NAMESPACE : &str= "global";

/// The function discrminator is constructed from these 8 bytes. Typically, the namespace is
/// "global" or "state"
pub fn ix_discriminator(name: &str) -> [u8; 8]{
    let preimage = format!("{}:{}", SIGHASH_GLOBAL_NAMESPACE, name);
    let mut sighash = [0u8; 8];
    sighash.copy_from_slice(
        &anchor_lang::solana_program::hash::hash(preimage.as_bytes()).to_bytes()[..8],
    );
    sighash
}


pub fn verify_cpi_caller(cpi_signer: &Signer, expected_caller_program: Pubkey, err_code: ErrorCode) -> Result<()> {

    let (_authorityPda, cpi_bump) = Pubkey::find_program_address(
        &[ SEEDS::CPI_SIGNER.as_bytes() ], &expected_caller_program
    );

    if cpi_signer.key() != _authorityPda.key() {
        msg!("verify_cpi_caller(): expected caller PDA signer: {:?} , bump: {:?}", _authorityPda.key(), cpi_bump);  // this is expected sender address!
        return Err(err_code.into());
    }

    Ok(())
}

