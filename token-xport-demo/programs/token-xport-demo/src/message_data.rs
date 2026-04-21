use anchor_lang::error_code;
use ethabi_solana::{encode, Address, Bytes, Uint, FixedBytes, Hash, Int, Word, decode, decode_whole, param_type, Token};
use ethabi_solana::ethereum_types_solana::U256;

#[derive(Debug, Clone)]
pub struct MessageData {
    pub message_type: String,
    pub from:Vec<u8>, // solana from address，
    pub to:Vec<u8>,   // evm to address
    pub amount:u64,
}

#[error_code]
pub enum CustomError {
    #[msg("Invalid data length: expected at least 160 bytes for 5 accounts")]
    InvalidDataLength,
    #[msg("Invalid account data: failed to parse account bytes")]
    InvalidAccountData,
    #[msg("Account mismatch: context account does not match expected account from data")]
    AccountMismatch,
    #[msg("Account mismatch: MessageType")]
    AccountMismatchMessageType,
    #[msg("Account mismathch: From ")]
    AccountMismatchFrom,
    #[msg("Account mismatch: To")]
    AccountMismatchTo,
    #[msg("Account mismatch: Amount")]
    AccountMismatchAmount
}

pub fn encode_message_data(message_data: &MessageData) -> Vec<u8>{
    let tuple_token = [
        Token::String(message_data.message_type.clone()),
        Token::Bytes(Bytes::from(message_data.from.clone())),
        Token::Address(Address::from_slice(message_data.to.clone().as_slice())),
        Token::Uint(Uint::from(message_data.amount.clone()))
    ];

    encode(&tuple_token)
}

pub fn decode_message_data(data: &[u8]) -> anchor_lang::Result<MessageData> {
    // Decode as tuple (for abi.encode((MessageData memory data)))
    let tuple_type = [param_type::ParamType::String, param_type::ParamType::Address, param_type::ParamType::Bytes, param_type::ParamType::Uint(128)];

    let tokens = decode(&tuple_type, data).map_err(|_| CustomError::InvalidAccountData)?;

    let message_type = match &tokens[0] {
        Token::String(s)=> s.clone(),
        _=> return Err(CustomError::AccountMismatchMessageType.into())
    };

    let from = match &tokens[1] {
        Token::Address(b) => b.clone(),
        _ => return Err(CustomError::AccountMismatchFrom.into()),
    };

    let to = match &tokens[2] {
        Token::Bytes(u) => u.clone(),
        _ => return Err(CustomError::AccountMismatchTo.into()),
    };

    let amount = match &tokens[3] {
        Token::Uint(u) => u.clone(),
        _ => return Err(CustomError::AccountMismatchAmount.into()),
    };

    let amount = amount.as_u64();

    Ok(MessageData {
        message_type,
        from:from.as_bytes().to_vec(),
        to,
        amount
    })



}