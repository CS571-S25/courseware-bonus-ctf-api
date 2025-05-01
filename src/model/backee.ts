export class BadgerBackee {
    public readonly name: string;
    public readonly owner: string;
    public readonly description: string;
    public amountGiven: number = 0;

    public constructor(name: string, owner: string, description: string) {
        this.name = name;
        this.owner = owner;
        this.description = description;
    }
}