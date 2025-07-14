import {TableCell, TableRow} from "@/components/ui/table";
import {TaskJoin} from "@/app/dashboard/batch-studio/tasks/type";

type EntityProps = {
    task: TaskJoin
}

export const Entity = ({task}: EntityProps) => {
    const name = task.brands?.name || task.categories?.name || task.combinations?.name

    return (
        <TableRow>
            <TableCell>{task.tasks.id}</TableCell>
            <TableCell>{name}</TableCell>
            <TableCell>{task.tasks.entityType}</TableCell>
            <TableCell>{task.tasks.status}</TableCell>
            <TableCell>a</TableCell>
        </TableRow>
    )
}