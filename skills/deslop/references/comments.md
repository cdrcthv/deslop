# Comments — examples

Rule of thumb: if deleting the comment loses no information a reader needs,
delete it. If it's kept, make it one short line about *why*.

## Delete these (they narrate the code)

```ts
// Get the user by id
const user = await getUserById(id);

// Check if the cart is empty
if (cart.items.length === 0) return;

// Increment counter
count++;
```

## Shorten these (essays)

```go
// Before: 6 lines explaining philosophy
// After:
// Advisory only; the order re-checks VAT server-side.
```

```ts
// Before:
// This function is responsible for taking the raw price coming from the API,
// which is expressed in cents as an integer, and converting it into a
// human-readable string formatted according to the user's locale...
// After: (nothing — the name formatCentsAsPrice says it)
```

## Keep these (short, non-obvious why)

```go
time.Sleep(200 * time.Millisecond) // VIES rate-limits bursts
```

```ts
// Safari doesn't fire `change` on autofill
input.addEventListener("input", sync);
```

```cs
// Belgian VAT: 21% default, 6% for books
```

```python
# TODO(cedric): remove after migration 042
```

## Doc comments on exported functions

One line, only if the name + signature isn't enough.

```go
// ParseEAN returns an error if the checksum digit is wrong.
func ParseEAN(s string) (EAN, error)
```

```ts
/** Rounds half-up, as required on invoices. */
export function roundInvoice(amount: number): number
```

Not:

```ts
/**
 * roundInvoice
 *
 * @description This function rounds the invoice amount.
 * @param amount - The amount to round. Must be a number.
 * @returns The rounded amount as a number.
 */
```

## Never

- Changelog comments: `// updated by AI`, `// fix for #42`, `// NEW`.
- Commented-out code blocks.
- Section banners: `// ============ HELPERS ============` (split the file instead).
- Comments that restate the type: `// string` next to a `string`.
