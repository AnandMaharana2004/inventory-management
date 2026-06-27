import { ConflictError, NotFoundError } from "@/lib/response";
import { customerRepository } from "@/repositories/customer.repository";
import type { CreateCustomerInput, UpdateCustomerInput } from "@/validation/customer.validation";

const CreateCustomer = async (body: CreateCustomerInput) => {
    const { gstin } = body;

    // GSTIN is optional, but if provided it must be unique
    if (gstin) {
        const existingCustomer = await customerRepository.getCustomerByGstin(gstin);
        if (existingCustomer) {
            throw new ConflictError("Customer with this GSTIN already exists.");
        }
    }

    return customerRepository.create(body);
};

const ListCustomers = async (search?: string) => {
    if (search) {
        return customerRepository.searchCustomers(search);
    }
    return customerRepository.getAllCustomers();
};

const GetCustomerById = async (id: number, includeBills?: boolean) => {
    const customer = includeBills
        ? await customerRepository.getCustomerWithBills(id)
        : await customerRepository.getCustomerById(id);

    if (!customer) {
        throw new NotFoundError("Customer not found.");
    }

    return customer;
};

const UpdateCustomer = async (id: number, body: UpdateCustomerInput) => {
    const existingCustomer = await customerRepository.getCustomerById(id);
    if (!existingCustomer) {
        throw new NotFoundError("Customer not found.");
    }

    // If gstin is being changed, make sure the new one isn't already taken by a different customer
    if (body.gstin && body.gstin !== existingCustomer.gstin) {
        const gstinOwner = await customerRepository.getCustomerByGstin(body.gstin);
        if (gstinOwner && gstinOwner.id !== id) {
            throw new ConflictError("Customer with this GSTIN already exists.");
        }
    }

    return customerRepository.updateCustomer(id, body);
};

const DeleteCustomer = async (id: number) => {
    const existingCustomer = await customerRepository.getCustomerById(id);
    if (!existingCustomer) {
        throw new NotFoundError("Customer not found.");
    }

    return customerRepository.deleteCustomer(id);
};

export const customerService = {
    CreateCustomer,
    ListCustomers,
    GetCustomerById,
    UpdateCustomer,
    DeleteCustomer,
};