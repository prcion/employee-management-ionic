export interface ActivityInterface {
    id?: number;
    name: string;
    createdDate: number | null;
    updatedDate: number | null;
    onEdit?: (id?: string) => void;
}
