# Secure acceptance rollout

This release changes the data boundary: bookings, seat counts, offer responses, PIN verification, ratings, and trip status changes execute in authenticated Firebase callable functions (`us-central1`). **Do not publish the new client by itself.** Existing APKs that directly write those fields will stop working with the new rules and must be upgraded.

## What is implemented

- A driver submits a priced offer for a passenger request. The passenger can reject it or accept one offer.
- Acceptance atomically creates a dedicated trip and confirmed cash booking, links the request/offer to both IDs, rejects competing offers, and writes notifications. The driver's original offer is their consent; a second driver acceptance is unnecessary.
- Retrying the same acceptance returns the same booking. Competing accepts and last-seat bookings are protected by Firestore transactions.
- Direct trip bookings remain pending until the driver accepts/rejects them.
- Private contact data is returned only to the owner/admin or the confirmed other party when a booking ID is supplied. Public profile responses contain an explicit field allowlist.
- Live positions and PINs no longer reside on publicly readable trip/driver-readable booking documents. Five incorrect PIN attempts produce a 15-minute lockout. Failed attempts are committed.
- Ratings require a completed shared booking and a deterministic per-author ID; recipient/role are derived server-side.
- Rejected drivers may resubmit documents as pending, without self-approval. Counters update only once on trip completion.
- Admin deletion of a trip with bookings is refused so booking history remains intact.

## Prerequisites

An authorized Firebase/Google Cloud account for the existing project, permission to deploy Functions/Firestore rules, and a plan that supports Cloud Functions deployment (normally Blaze) are required. No deployment credentials are embedded in the repository. The frontend uses its existing Firebase project configuration.

## Deployment order

1. Schedule a maintenance window and take a Firestore export/backup. Stop new bookings during migration. Keep old clients closed until the rollout finishes.
2. `npm ci` and `npm ci --prefix functions`.
3. Run checks locally or in CI:
   ```sh
   npm run lint
   npm run build
   ./functions/node_modules/.bin/firebase emulators:exec --only firestore --project demo-mosafer 'npm --prefix functions test'
   ```
4. Authenticate Firebase CLI and Application Default Credentials using the project owner's normal approved workflow. Select the intended project explicitly in every command.
5. Preview migration (prints counts only):
   ```sh
   node functions/scripts/migrate.js --project=YOUR_PROJECT_ID
   ```
   Review the backup and counts, then run the same command with `--apply` during the maintenance window. It moves/rotates legacy PINs into private documents, removes old live positions from public trips, creates membership records for confirmed bookings, and adds expiry/departure timestamps to legacy requests/offers. It is repeatable. Existing live location sharing must be restarted in the updated client.
6. Deploy backend and rules/indexes together before releasing clients:
   ```sh
   ./functions/node_modules/.bin/firebase deploy --only functions,firestore --project YOUR_PROJECT_ID
   ```
7. Merge/release the frontend and distribute the updated APK. A main-branch merge triggers the existing Pages workflow; do not merge before steps 1–6 are complete.
8. Test with separate passenger, approved driver, and unrelated accounts: send an offer; accept it; verify both dashboards and the notification links; enter a wrong PIN; enter the correct PIN; start/finish the trip; rate it; check cancellation releases seats once.

## Existing records and intentional limits

- Accepted legacy offers without a linked booking are counted by migration and require support review. Do not silently create retroactive bookings or charge passengers.
- Existing paid/refund-pending wallet bookings require manual reconciliation by the administrator. Browser-side refunds are intentionally removed.
- Cash is the supported payment method in this release. Wallet payments, coupon redemption, referral bonuses, SMS verification/self-service account recovery and external push delivery are **not activated** by these changes. They need separate provider configuration and tested workflows; the UI must not claim they are active.
- Migrating existing ratings into aggregate counters is a separate data-cleanup decision. Existing totals are retained; new aggregate fields are only initialized from legacy reviews when needed by the rating service.
- National ID/license uploads still use the existing Cloudinary upload configuration. Production storage access, retention and provider settings need owner review.

## Android release

Debug APK remains available. The new manual `Signed Android release` workflow produces a signed AAB when the `android-release` GitHub environment contains `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`. Use the existing app's signing key if it has been published before. Supply an increasing version code and version name. No signing key was generated or added to the repository and no store publication is automatic.

## Rollback

Keep the backup and previously deployed client/build identifiers. Prefer fixing forward. Do not roll back to broadly readable user/PIN/location rules or reintroduce direct browser writes. A backend rollback must retain the private data model and callable contracts; otherwise remain in maintenance mode until a compatible build is deployed.
