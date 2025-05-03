"use client";

import { use } from "react";
import { DataTable } from "@/components/datatable/data-table";
import { DataTableToolbar } from "@/components/datatable/data-table-toolbar";
import { DataTableSortList } from "@/components/datatable/data-table-sort-list";
import { Translation } from "@/db/schema";
import { useCustomAction } from "@/hooks/use-custom-action";
import { deleteTranslation } from "./actions";
import { toast } from "sonner";
import { useTranslationParams } from "@/app/dashboard/translations/use-translation-params";
import { useDataTable } from "@/hooks/use-data-table";
import { getTranslationTableColumns } from "@/app/dashboard/translations/translation-table-columns";
import { TranslationTableActionBar } from "@/app/dashboard/translations/translation-table-action-bar";
import { getTranslations } from "@/app/dashboard/translations/queries";

interface TranslationTableProps {
    promise: Promise<Awaited<ReturnType<typeof getTranslations>>>;
}

export function TranslationTable({ promise }: TranslationTableProps) {
    const { data, pageCount } = use(promise);
    const { setParams } = useTranslationParams();

    const deleteTranslationAction = useCustomAction(deleteTranslation, {
        onSuccess: ({ data }) => {
            toast.success(data?.message);
        }
    });

    // Handle edit dialog open
    const handleEditClick = (translation: Translation) => {
        setParams({ editTranslation: translation.id });
    };

    // Handle delete translation
    const handleDeleteTranslation = async (id: number) => {
        deleteTranslationAction.execute({ id });
    };

    const columns = getTranslationTableColumns(
        handleEditClick,
        handleDeleteTranslation,
        deleteTranslationAction.isPending
    );

    const { table } = useDataTable({
        data,
        columns,
        pageCount,
        initialState: {
            sorting: [{ id: "entityType", desc: false }],
        },
        shallow: false,
        clearOnDefault: true,
    });

    return (
        <>
            <DataTable
                table={table}
                actionBar={<TranslationTableActionBar table={table} />}
            >
                <DataTableToolbar table={table}>
                    <DataTableSortList table={table} align="end" />
                </DataTableToolbar>
            </DataTable>
        </>
    );
}
