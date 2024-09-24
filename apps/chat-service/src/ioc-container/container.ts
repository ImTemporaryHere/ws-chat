import { ServiceTypes } from "./service-types";

type Constructor = new (...params: any) => any;

type ServiceDefinition =
  | Constructor // Constructor function (class)
  | ((...params: any) => any); // Regular function

export class IocContainer {
  private static instance: IocContainer;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new IocContainer();
    }

    return this.instance;
  }

  private registeredServices: Map<
    string,
    {
      definition: ServiceDefinition;
      dependencies?: Array<keyof ServiceTypes>;
    }
  > = new Map();

  private instances: Map<keyof ServiceTypes, ServiceTypes[keyof ServiceTypes]> =
    new Map();

  register(
    name: keyof ServiceTypes,
    definition: any,
    dependencies?: Array<keyof ServiceTypes>,
  ) {
    this.registeredServices.set(name, {
      definition,
      dependencies,
    });
    return this;
  }

  get<T extends keyof ServiceTypes>(serviceName: T): ServiceTypes[T] {
    const registeredService = this.registeredServices.get(serviceName);
    if (!registeredService) {
      throw new Error(`Service ${serviceName} not found in Container`);
    }

    const exisingInstance = this.instances.get(serviceName) as
      | ServiceTypes[T]
      | undefined;

    if (exisingInstance) {
      return exisingInstance;
    }
    const { definition, dependencies = [] } = registeredService;
    const args = dependencies.map((dp) => this.get(dp));
    const instance =
      typeof definition === "function" && definition.prototype
        ? new (definition as Constructor)(...args)
        : (definition as Function)(...args);
    this.instances.set(serviceName, instance);
    return instance;
  }
}
