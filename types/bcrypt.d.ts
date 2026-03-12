declare module "bcrypt" {
  function compare(data: string, encrypted: string): Promise<boolean>
  function hash(
    data: string,
    saltOrRounds: string | number
  ): Promise<string>
}
