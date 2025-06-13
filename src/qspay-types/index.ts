import { z } from "zod";

export const QSPayAuthResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expires: z.string(),
    issued: z.string(),
    expiresIn: z.number(),
    isPasswordTemporary: z.boolean(),
    passwordChangeRequired: z.boolean(),
    clientIP: z.string().nullable(),
});

export type QSPayAuthResponse = z.infer<typeof QSPayAuthResponseSchema>;

export const QSPayStoreSchema = z.object({
    storeId: z.string(),
    name: z.string(),
    storeUrl: z.string(),
    customerDeleteDay: z.number(),
    priority: z.number(),
    googleTrackingId: z.string(),
    recordStatus: z.string(),
    merchantId: z.string(),
    createdAt: z.string(),
    erpReferenceId: z.string(),
    searchApiUrl: z.string().nullable(),
    bankAccounts: z.array(z.object({})),
    gateways: z.array(z.object({})),
    paymentMethods: z.array(z.object({})),
})

export type QSPayStore = z.infer<typeof QSPayStoreSchema>;

export const QSPayUserSchema = z.object({
    info: z.object({
        id: z.string(),
        email: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        phoneNumber: z.string().nullable(),
        emailConfirmed: z.boolean(),
        recordStatus: z.string(),
        typeId: z.number(),
        typeName: z.string(),
        storeIds: z.array(z.string()).nullable(),
        erpReferenceId: z.string().nullable(),
        roles: z.array(z.string()).nullable(),
    }),
    companies: z.array(
        z.object({
            info: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                phoneNumber: z.string().nullable(),
                typeId: z.number(),
                typeName: z.string(),
                parentId: z.string(),
                parent: z.string(),
                taxOffice: z.string(),
                taxNo: z.string(),
                setupCompleted: z.boolean(),
                recordStatus: z.string(),
                allowToAnalyze: z.object({
                    config: z.boolean(),
                    order: z.boolean(),
                    customer: z.boolean(),
                }),
                street: z.string().nullable(),
                postCode: z.string().nullable(),
                place: z.string().nullable(),
                board: z.string().nullable(),
                salesTaxNo: z.string().nullable(),
                createdAt: z.string(),
                permittedIp: z.array(z.string()).nullable(),
                packageId: z.string().nullable(),
                platformType: z.number(),
                orderEmailFooter: z.string().nullable(),
                commercialRegistrationNumber: z.string().nullable(),
            }),
            merchants: z.array(
                z.object({
                    info: z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string(),
                        phoneNumber: z.string().nullable(),
                        typeId: z.number(),
                        typeName: z.string(),
                        parentId: z.string(),
                        parent: z.string(),
                        taxOffice: z.string(),
                        taxNo: z.string(),
                        setupCompleted: z.boolean(),
                        recordStatus: z.string(),
                        allowToAnalyze: z.object({
                            config: z.boolean(),
                            order: z.boolean(),
                            customer: z.boolean(),
                        }),
                        street: z.string().nullable(),
                        postCode: z.string().nullable(),
                        place: z.string().nullable(),
                        board: z.string().nullable(),
                        salesTaxNo: z.string().nullable(),
                        createdAt: z.string(),
                        permittedIp: z.array(z.string()).nullable(),
                        packageId: z.string().nullable(),
                        platformType: z.number(),
                        orderEmailFooter: z.string().nullable(),
                        commercialRegistrationNumber: z.string().nullable(),
                    }),
                    stores: z.array(z.object({...QSPayStoreSchema.shape})),
                })
            ),
        })
    ),
});

export type QSPayUser = z.infer<typeof QSPayUserSchema>;
