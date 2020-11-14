export interface ActivityInterface {
    id?: number;
    name: string;
    createdDate?: number;
    updatedDate?: number;
    onEdit?: (id?: string) => void;
}
