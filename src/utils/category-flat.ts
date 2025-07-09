import {QSPayCategory} from "@/qspay-types";

export const categoryFlat = (arr: QSPayCategory[]): QSPayCategory[] => arr.flatMap(({
                                                                         children,
                                                                         ...rest
                                                                     }) => [rest, ...(children ? categoryFlat(children) : [])]);