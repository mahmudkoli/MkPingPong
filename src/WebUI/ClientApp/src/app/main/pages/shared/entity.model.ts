
export class Entity {
    id: string;
    isDeleted: boolean;
    isActive: boolean;

    clear() {
        this.id = '';
        this.isActive = false;
        this.isDeleted = false;
    }
}
