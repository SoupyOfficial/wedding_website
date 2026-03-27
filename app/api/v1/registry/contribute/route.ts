import { NextRequest } from "next/server";
import { queryOne, execute, generateId } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { RegistryItem } from "@/lib/db-types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, amount, guestName, guestEmail } = body;

    if (!id || amount == null || isNaN(amount) || amount <= 0) {
      return errorResponse("Invalid parameters.", 400);
    }
    if (!guestName?.trim()) {
      return errorResponse("Guest name is required.", 400);
    }

    const item = await queryOne<RegistryItem>(
      "SELECT * FROM RegistryItem WHERE id = ?",
      [id]
    );

    if (!item) {
      return errorResponse("Registry item not found.", 404);
    }

    if (item.status !== "active") {
      return errorResponse("This item is no longer accepting contributions.", 400);
    }

    // Validate by item type
    if (item.itemType === "fund") {
      if (item.goalAmount) {
        if (item.raisedAmount >= item.goalAmount) {
          return errorResponse("This fund has already reached its goal!", 400);
        }
        const remaining = item.goalAmount - item.raisedAmount;
        if (amount > remaining) {
          return errorResponse(
            `Contribution exceeds the remaining goal. Maximum: $${remaining.toLocaleString()}`,
            400
          );
        }
      }
    } else if (item.itemType === "product") {
      const needed = item.totalNeeded || 1;
      if (item.totalBought >= needed) {
        return errorResponse("This item has already been fully purchased.", 400);
      }
    } else {
      return errorResponse("Store links cannot be contributed to directly.", 400);
    }

    // Update tracking totals
    if (item.itemType === "fund") {
      await execute(
        "UPDATE RegistryItem SET raisedAmount = raisedAmount + ? WHERE id = ?",
        [amount, id]
      );
      // Auto-fulfill when goal is reached
      if (item.goalAmount && item.raisedAmount + amount >= item.goalAmount) {
        await execute(
          "UPDATE RegistryItem SET status = 'fulfilled' WHERE id = ?",
          [id]
        );
      }
    } else {
      await execute(
        "UPDATE RegistryItem SET totalBought = totalBought + 1 WHERE id = ?",
        [id]
      );
      // Auto-fulfill when all units purchased
      const needed = item.totalNeeded || 1;
      if (item.totalBought + 1 >= needed) {
        await execute(
          "UPDATE RegistryItem SET status = 'fulfilled' WHERE id = ?",
          [id]
        );
      }
    }

    // Insert contribution record
    await execute(
      "INSERT INTO RegistryContribution (id, registryItemId, guestName, guestEmail, amount, status) VALUES (?, ?, ?, ?, ?, ?)",
      [generateId(), id, guestName.trim(), guestEmail?.trim() || null, amount, "confirmed"]
    );

    return successResponse({ success: true });
  } catch (error) {
    console.error("Failed to process contribution:", error);
    return errorResponse("Internal server error.", 500);
  }
}
