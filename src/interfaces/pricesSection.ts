export interface IPricesSection {
    topic: string;
    description: string;
    listOfPackages: IPackages[];
}

export interface IPackages {
    title: string;
    description: string;
    featuresOfPackage: string[];
    price: string;
}
