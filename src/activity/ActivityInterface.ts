export interface ActivityInterface {
    id?: number;
    name: string;
    userId?: number;
    createdDate: number | null;
    updatedDate: number | null;
    onEdit?: (id?: string) => void;
}
