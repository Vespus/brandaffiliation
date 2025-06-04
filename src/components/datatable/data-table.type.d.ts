import { RowData } from "@tanstack/react-table";
import { createFormatter } from "next-intl";

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface TableMeta<TData extends RowData> {
        t: (id: string) => string;
        formatter?: ReturnType<typeof createFormatter>
    }
}