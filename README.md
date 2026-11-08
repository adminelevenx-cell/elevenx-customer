# ElevenX Customer Android App — source package

Ionic Angular 19 + Capacitor 7 customer storefront for the shared ElevenX Supabase project.

## Included in this update
- Merchandise catalogue with search and product-type filters.
- Customisation Studio with front/back preview, product/text colours, names/numbers and artwork upload.
- Private customer design uploads to the `customer-designs` Storage bucket and saved drafts in `custom_designs`.
- Customisation snapshot attached to `cart_items.customization` and carried into checkout's order-item snapshot by the backend checkout flow.
- Shopping bag with quantities/removal, address book flow and server-side checkout RPC.
- Wishlist read view, notification inbox/read state and Android FCM token registration.
- Order history and account pages.
- Delivery address form with OpenStreetMap/Leaflet pin selection, GPS location capture, latitude/longitude and rider instructions.
- Mobile-money payment screen for MTN/Airtel numbers, invoking the existing authenticated `relworx-initiate-payment` Edge Function and polling the customer-owned payment record for provider-confirmed status.

## Important integration status
This is an updated **source project**, not a verified production APK. The current Supabase project ref is `uuzbsgnxoryxkbnaqxyt`. The publishable key remains a local placeholder by design. Set it in `src/environments/environment.ts` and `environment.prod.ts` on your machine; never place a service-role/secret key in the app.

The project already has `customer-designs` private storage, `custom_designs`, `favorites`, `notifications`, `cart_items.customization`, checkout and push-token tables according to the current backend inspection. Storage RLS and table RLS must allow only each authenticated user to access their own designs, favorites, notifications, cart and addresses.

**Not yet completed/verified:** production Angular build and Android APK build (npm dependency installation timed out in this environment); physical Android device testing; real provider payment flow and callback verification (no real charges have been attempted); product template gallery from Admin-managed published templates; complete product variant/design print-area validation. Checkout now routes to the payment screen, which calls the existing Relworx Edge Function. Do not tell customers they have paid until a verified provider callback updates the payment record to `successful`.

## Build on your development machine
1. Install Node.js 20+ and Java 17; install Android Studio with Android SDK.
2. Configure the Supabase URL and publishable key in both environment files.
3. Run `npm ci` (or `npm install` if no lockfile is present).
4. Run `npm run build`.
5. Run `npx cap add android` once if the Android folder does not exist.
6. Put the Customer app's Firebase `google-services.json` at `android/app/google-services.json`.
7. Run `npx cap sync android`, then open Android Studio with `npx cap open android`.
8. Build and test a debug APK first. Test registration, sign-in, catalogue, artwork upload, save design, add-to-bag, checkout, map pin/GPS, MTN and Airtel sandbox payment requests, notification permission and order history before release. Never use real customer money during testing.

## Security
- Client app must use only the Supabase publishable key.
- Never bundle Supabase service-role/secret keys or payment provider credentials.
- Mobile money initiation and callbacks must stay server-side in Supabase Edge Functions.
- Ensure Storage bucket `customer-designs` is private and has owner-scoped policies.

## Delivery map and rider coordinates

The checkout address form now includes an interactive OpenStreetMap picker (no paid map API key required), a current-location button, and a draggable-by-reselection pin. The selected latitude and longitude are stored in the existing `addresses.latitude` and `addresses.longitude` columns in Supabase alongside the written address. Customers can still type the address and use the map only when they want to provide a precise pin.

The map uses OpenStreetMap public tiles and requires an internet connection. Android location access is requested only when the customer taps **Use my current location**; manual map selection does not require location permission. Review the generated Android manifest after `npx cap add android` and ensure `ACCESS_COARSE_LOCATION` and `ACCESS_FINE_LOCATION` permissions are present for the native location plugin. Do not request location continuously or in the background.

Install the pinned dependencies with `npm install`, then run `npm run build` and `npx cap sync android`. The build has not been verified in this environment because dependency installation timed out; test on a physical Android device before release.
