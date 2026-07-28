# Createch Customer Auth

Token-authenticated customer accounts for the headless Next.js storefront:
register, sign in, edit the saved delivery address, and list order history.

## Install

1. Zip the `createch-customer-auth` folder (or use `createch-customer-auth.zip`).
2. wp-admin → Plugins → Add New → Upload Plugin → Activate.
3. Nothing to configure. The signing key is generated on first use and stored in
   the `crtch_auth_secret` option.

Requires WooCommerce.

## How the storefront talks to it

The browser never calls these endpoints. The Next.js route handlers in
`app/api/account/*` call them server-to-server and keep the JWT in an **httpOnly
cookie**, so storefront JavaScript — and any XSS that reaches it — cannot read
the token. That is also why this plugin sends no CORS headers, unlike
`createch-store-api-cors`.

```
browser ──(httpOnly cookie)──> Next route handler ──(Bearer JWT)──> WordPress
```

## Endpoints

All under `/wp-json/createch/v1`.

| Method | Path                    | Auth   | Purpose |
| ------ | ----------------------- | ------ | ------- |
| POST   | `/auth/register`        | –      | Create a WooCommerce customer, return a token |
| POST   | `/auth/login`           | –      | Exchange email + password for a token |
| POST   | `/auth/forgot`          | –      | Trigger WordPress's own password-reset email |
| GET    | `/account`              | Bearer | Profile + billing/shipping address |
| PUT    | `/account`              | Bearer | Update name and addresses |
| GET    | `/account/orders`       | Bearer | Order history (paged) |
| POST   | `/account/claim-order`  | Bearer | Attach a just-placed order to the account |

### Why `claim-order` exists

The storefront checkout drives the WooCommerce **Store API** as a guest — the
cart is identified by a `Cart-Token`, not a logged-in user — so every order is
created with `customer_id = 0` and would never appear in order history. Right
after checkout the frontend posts the new order's id and `order_key`, and this
endpoint adopts the order. The `order_key` is the per-order secret WooCommerce
returns only to the browser that placed the order, so a signed-in customer
cannot claim order numbers they simply guessed.

## Token design

HS256 JWT, 30-day expiry, signed with the `crtch_auth_secret` option.

The payload carries `fpr` — a short fingerprint of the user's password hash — so
**changing or resetting a password invalidates every token issued before it**.
Deleting the `crtch_auth_secret` option signs everyone out at once, without
rotating the WordPress salts and logging every wp-admin user out too.

## Deliberate behaviours

- **Login and forgot-password never reveal whether an email is registered.**
  Both return the same response either way, so neither can be used to test which
  addresses have accounts.
- **Login is throttled** to 8 failures per email+IP per 15 minutes, counted in a
  transient.
- **Order history is not matched on billing email.** It is keyed strictly on
  `customer_id`. Matching on email would let anyone register with someone else's
  address and read that person's past guest orders — name, phone and delivery
  address included.
- **The account email is not editable here.** It is the login identity, so
  changing it needs a separate verified flow; `PUT /account` only moves the
  billing copy.
