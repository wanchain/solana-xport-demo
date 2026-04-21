use anchor_lang::solana_program::{pubkey, pubkey::Pubkey};

pub const ADMIN_PUBKEY: Pubkey = pubkey!("WaniPEbind6V8fHqhSMBQMTwew9QBkY5AM5TVdKnZXC");

// Instruction discriminators
pub const GATEWAY_OUTBOUND_CALL_IX_ID: [u8; 8] = [191, 90, 21, 148, 53, 150, 234, 127];


pub struct SEEDS {}

impl SEEDS {
    pub const ADMIN_ROLE : &'static str = "admin_roles";

    pub const MAPPING_TOKEN_SEEDS_PREFIX: &'static str = "mapping_token";

    pub const META_DATA_PREFIX: &'static str = "metadata";

    pub const TOKEN_SEED_PREFIX: &'static str = "TokenSeed";

    pub const CPI_SIGNER: &'static str = "CpiSigner";

    pub const AUXILIARY: &'static str = "Auxiliary";

}