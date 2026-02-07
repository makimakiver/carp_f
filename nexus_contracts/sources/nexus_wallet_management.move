module nexus_wallet_management::nexus_wallet_management;

use std::string::String;
use sui::table::{Self, Table};
use ika_dwallet_2pc_mpc::coordinator_inner::DWalletCap;
use ika_dwallet_2pc_mpc::coordinator_inner::{UnverifiedPresignCap};

// ── Errors ──────────────────────────────────────────────────────────
const ENotOwner: u64 = 0;
const EWalletNotFound: u64 = 1;
const EPresignNotFound: u64 = 2;

// ── Structs ─────────────────────────────────────────────────────────

/// A single dWallet entry in the registry.
public struct WalletEntry has store, drop, copy {
    /// The on-chain address of the dWallet object (derived from DWalletCap.dwallet_id)
    dwallet_addr: address,
    /// The session ID used for the DKG
    session_id: vector<u64>,
    /// The user's public output from the DKG
    user_public_output: vector<u8>,
    /// Human-readable label, e.g. "Main EVM"
    label: String,
    /// Target chain, e.g. "evm" or "solana"
    chain: String,
    /// The presign IDs for the dWallet
    presign_ids: vector<ID>,
}

/// Updated WalletRegistry to use UserWallets
public struct WalletRegistry has key {
    id: UID,
    /// address → UserWallets
    wallets: Table<address, vector<WalletEntry>>,
}
// ── Init ────────────────────────────────────────────────────────────

fun init(ctx: &mut TxContext) {
    let registry = WalletRegistry {
        id: object::new(ctx),
        wallets: table::new(ctx),
    };
    transfer::share_object(registry);

}

// ── Public entry functions ──────────────────────────────────────────

/// Register a newly created dWallet.
/// Called right after the DKG completes and the caller holds a DWalletCap.
/// Extracts the dWallet address from the cap and stores it under the sender.
public fun register_dwallet(
    registry: &mut WalletRegistry,
    label: String,
    chain: String,
    dwallet_cap: &DWalletCap,
    session_id: vector<u64>,
    user_public_output: vector<u8>,
    ctx: &TxContext,
) {
    let sender = tx_context::sender(ctx);
    let entry = WalletEntry {
        dwallet_addr: dwallet_cap.dwallet_id().to_address(),
        session_id,
        user_public_output,
        label,
        chain,
        presign_ids: vector::empty<ID>(),
    };

    if (table::contains(&registry.wallets, sender)) {
        let entries = table::borrow_mut(&mut registry.wallets, sender);
        vector::push_back(entries, entry);
    } else {
        let mut entries = vector::empty<WalletEntry>();
        vector::push_back(&mut entries, entry);
        table::add(&mut registry.wallets, sender, entries);
    };
}

public fun add_presign_id(
    registry: &mut WalletRegistry,
    dwallet_addr: address,
    presign_cap: &UnverifiedPresignCap,
    ctx: &TxContext,
) {
    let sender = tx_context::sender(ctx);
    assert!(table::contains(&registry.wallets, sender), ENotOwner);

    let entries = table::borrow_mut(&mut registry.wallets, sender);
    let len = vector::length(entries);

    let mut i = 0;
    let mut found = false;

    while (i < len) {
        // Need a mutable borrow of the entry to mutate presign_ids
        let entry_ref = vector::borrow_mut(entries, i);
        if (entry_ref.dwallet_addr == dwallet_addr) {
            vector::push_back(&mut entry_ref.presign_ids, object::id(presign_cap));
            found = true;
            break
        };
        i = i + 1;
    };

    assert!(found, EWalletNotFound);
}

/// Remove a presign ID from a wallet entry after it has been consumed (used for signing).
/// Only the owner can remove presign IDs from their own entries.
public fun remove_presign_id(
    registry: &mut WalletRegistry,
    dwallet_addr: address,
    presign_id: ID,
    ctx: &TxContext,
) {
    let sender = tx_context::sender(ctx);
    assert!(table::contains(&registry.wallets, sender), ENotOwner);

    let entries = table::borrow_mut(&mut registry.wallets, sender);
    let len = vector::length(entries);

    let mut i = 0;
    let mut wallet_found = false;

    while (i < len) {
        let entry_ref = vector::borrow_mut(entries, i);
        if (entry_ref.dwallet_addr == dwallet_addr) {
            wallet_found = true;
            let presigns = &mut entry_ref.presign_ids;
            let plen = vector::length(presigns);
            let mut j = 0;
            let mut presign_found = false;
            while (j < plen) {
                if (*vector::borrow(presigns, j) == presign_id) {
                    vector::swap_remove(presigns, j);
                    presign_found = true;
                    break
                };
                j = j + 1;
            };
            assert!(presign_found, EPresignNotFound);
            break
        };
        i = i + 1;
    };

    assert!(wallet_found, EWalletNotFound);
}

// /// Remove a dWallet entry by its address.
// /// Only the owner (the address whose table row it lives in) can remove it.
// public fun remove_dwallet(
//     registry: &mut WalletRegistry,
//     dwallet_addr: address,
//     ctx: &TxContext,
// ) {
//     let sender = tx_context::sender(ctx);
//     assert!(table::contains(&registry.wallets, sender), ENotOwner);

//     let entries = table::borrow_mut(&mut registry.wallets, sender);
//     let len = vector::length(entries);
//     let mut i = 0;
//     let mut found = false;
//     while (i < len) {
//         if (vector::borrow(entries, i).dwallet_addr == dwallet_addr) {
//             vector::swap_remove(entries, i);
//             found = true;
//             break
//         };
//         i = i + 1;
//     };
//     assert!(found, EWalletNotFound);
// }

// // ── View helpers ────────────────────────────────────────────────────

// /// Number of dWallets registered by `owner`.
// public fun wallet_count(registry: &WalletRegistry, owner: address): u64 {
//     if (table::contains(&registry.wallets, owner)) {
//         vector::length(table::borrow(&registry.wallets, owner))
//     } else {
//         0
//     }
// }

/// Whether `owner` has any registered dWallets.
public fun has_wallets(registry: &WalletRegistry, owner: address): bool {
    table::contains(&registry.wallets, owner)
}

/// Borrow the full list of wallet entries for `owner`.
/// Aborts if the owner has no entries.
public fun get_wallets(registry: &WalletRegistry, owner: address): &vector<WalletEntry> {
    table::borrow(&registry.wallets, owner)
}

/// Read the dWallet address from an entry.
public fun entry_dwallet_addr(entry: &WalletEntry): address {
    entry.dwallet_addr
}

/// Read the label from an entry.
public fun entry_label(entry: &WalletEntry): &String {
    &entry.label
}

/// Read the chain from an entry.
public fun entry_chain(entry: &WalletEntry): &String {
    &entry.chain
}
