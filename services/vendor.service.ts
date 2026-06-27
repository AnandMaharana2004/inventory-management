import { ConflictError, NotFoundError } from "@/lib/response";
import { vendorRepository } from "@/repositories/vendor.repository";
import type { CreateVendorInput, UpdateVendorInput } from "@/validation/vendor.validation";

const CreateVendor = async (body: CreateVendorInput) => {
    const { gstin } = body;

    // GSTIN is optional, but if provided it must be unique
    if (gstin) {
        const existingVendor = await vendorRepository.getVendorByGstin(gstin);
        if (existingVendor) {
            throw new ConflictError("Vendor with this GSTIN already exists.");
        }
    }

    return vendorRepository.create(body);
};

const ListVendors = async (search?: string) => {
    if (search) {
        return vendorRepository.getVendorByName(search);
    }
    return vendorRepository.getAllVendors();
};

const GetVendorById = async (id: number) => {
    const vendor = await vendorRepository.getVendorById(id);
    if (!vendor) {
        throw new NotFoundError("Vendor not found.");
    }
    return vendor;
};

const UpdateVendor = async (id: number, body: UpdateVendorInput) => {
    // Confirm vendor exists before touching it
    const existingVendor = await vendorRepository.getVendorById(id);
    if (!existingVendor) {
        throw new NotFoundError("Vendor not found.");
    }

    // If gstin is being changed, make sure the new one isn't already taken by a different vendor
    if (body.gstin && body.gstin !== existingVendor.gstin) {
        const gstinOwner = await vendorRepository.getVendorByGstin(body.gstin);
        if (gstinOwner && gstinOwner.id !== id) {
            throw new ConflictError("Vendor with this GSTIN already exists.");
        }
    }

    return vendorRepository.updateVendor(id, body);
};

const DeleteVendor = async (id: number) => {
    const existingVendor = await vendorRepository.getVendorById(id);
    if (!existingVendor) {
        throw new NotFoundError("Vendor not found.");
    }

    return vendorRepository.deleteVendor(id);
};

export const vendorService = {
    CreateVendor,
    ListVendors,
    GetVendorById,
    UpdateVendor,
    DeleteVendor,
};