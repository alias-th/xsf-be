import { appDataSource } from "../datasource";

const runUpMigration = async () => {
  const connection = await appDataSource.initialize();
};
