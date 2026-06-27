import { ConflictError, NotFoundError } from "@/lib/response";
import { itemRepository } from "@/repositories/item.repository";
import type { CreateItemInput, UpdateItemInput } from "@/validation/item.validation";

const CreateItem = async (body: CreateItemInput) => {
    const { itemCode } = body;

    const existingItem = await itemRepository.getItemByCode(itemCode);
    if (existingItem) {
        throw new ConflictError("Item code already exists.");
    }

    return itemRepository.create(body);
};

type ItemListFilter = "all" | "active";

const ListItems = async (search?: string, filter: ItemListFilter = "all") => {
    // Search takes priority over the active/all filter — it's a broader, explicit lookup
    if (search) {
        return itemRepository.searchItems(search);
    }
    if (filter === "active") {
        return itemRepository.getActiveItems();
    }
    return itemRepository.getAllItems();
};

type ItemInclude = "stock" | "purchaseHistory" | "salesHistory";

const GetItemById = async (id: number, include?: ItemInclude) => {
    let item;

    switch (include) {
        case "stock":
            item = await itemRepository.getItemWithStock(id);
            break;
        case "purchaseHistory":
            item = await itemRepository.getItemWithPurchaseHistory(id);
            break;
        case "salesHistory":
            item = await itemRepository.getItemWithSalesHistory(id);
            break;
        default:
            item = await itemRepository.getItemById(id);
    }

    if (!item) {
        throw new NotFoundError("Item not found.");
    }

    return item;
};

const UpdateItem = async (id: number, body: UpdateItemInput) => {
    const existingItem = await itemRepository.getItemById(id);
    if (!existingItem) {
        throw new NotFoundError("Item not found.");
    }

    // If itemCode is being changed, make sure the new one isn't already taken
    if (body.itemCode && body.itemCode !== existingItem.itemCode) {
        const codeOwner = await itemRepository.getItemByCode(body.itemCode);
        if (codeOwner && codeOwner.id !== id) {
            throw new ConflictError("Item code already exists.");
        }
    }

    return itemRepository.updateItem(id, body);
};

const ActivateItem = async (id: number) => {
    const existingItem = await itemRepository.getItemById(id);
    if (!existingItem) {
        throw new NotFoundError("Item not found.");
    }
    return itemRepository.activateItem(id);
};

const DeactivateItem = async (id: number) => {
    const existingItem = await itemRepository.getItemById(id);
    if (!existingItem) {
        throw new NotFoundError("Item not found.");
    }
    return itemRepository.deactivateItem(id);
};

const DeleteItem = async (id: number) => {
    const existingItem = await itemRepository.getItemById(id);
    if (!existingItem) {
        throw new NotFoundError("Item not found.");
    }
    return itemRepository.deleteItem(id);
};

export const itemService = {
    CreateItem,
    ListItems,
    GetItemById,
    UpdateItem,
    ActivateItem,
    DeactivateItem,
    DeleteItem,
};