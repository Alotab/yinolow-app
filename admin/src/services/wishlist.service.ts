import { Wishlist } from "../models/Wishlist";

/// Not Using this ++++++

// ✅ Merge guest wishlist into user's wishlist
export async function mergeGuestWishlistssss(guestId: string, userId: string) {
  const guestWishlist = await Wishlist.findOne({ userId: guestId });
  if (!guestWishlist) return;

  let userWishlist = await Wishlist.findOne({ userId });
  if (!userWishlist) {
    // Just transfer directly if user has no wishlist
    userWishlist = new Wishlist({
      userId,
      items: guestWishlist.items.map(item => ({
        productId: item.productId,
        addedAt: new Date(), // ✅ Include addedAt
      })),
    });
  } else {
    // Filter out duplicates
    const existingIds = new Set(userWishlist.items.map(i => i.productId.toString()));
    const newItems = guestWishlist.items
      .filter(i => !existingIds.has(i.productId.toString()))
      .map(i => ({
        productId: i.productId,
        addedAt: new Date(), // ✅ Include addedAt
      }));

    userWishlist.items.push(...newItems);
  }

  await userWishlist.save();
  await Wishlist.deleteOne({ userId: guestId }); // clear guest wishlist
}

