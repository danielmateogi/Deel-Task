import * as Sequelize from 'sequelize';
import {
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';

const sequelize = new Sequelize.Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3',
  benchmark: true,
});

class Profile extends Sequelize.Model<InferAttributes<Profile>, InferCreationAttributes<Profile>> {
  declare id: CreationOptional<number>;
  declare firstName: string;
  declare lastName: string;
  declare profession: string;
  declare balance: number;
  declare type: 'client' | 'contractor';
}

class Contract extends Sequelize.Model<InferAttributes<Contract>, InferCreationAttributes<Contract>> {
  declare id: CreationOptional<number>;
  declare terms: string;
  declare status: 'new' | 'in_progress' | 'terminated';
  declare ContractorId: ForeignKey<Profile['id']>;
  declare ClientId: ForeignKey<Profile['id']>;

  declare Jobs?: NonAttribute<Job[]>;
  declare Client?: NonAttribute<Profile>;
  declare Contractor?: NonAttribute<Profile>;
}

class Job extends Sequelize.Model<InferAttributes<Job>, InferCreationAttributes<Job>> {
  declare id: CreationOptional<number>;
  declare description: string;
  declare price: number;
  declare paid: CreationOptional<boolean>;
  declare paymentDate: CreationOptional<string | null>;

  declare ContractId: ForeignKey<Contract['id']>;
  declare Contract?: NonAttribute<Contract>;
}

Profile.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    profession: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    balance: {
      type: Sequelize.DECIMAL(12, 2),
    },
    type: {
      type: Sequelize.ENUM('client', 'contractor'),
    },
  },
  {
    sequelize,
    modelName: 'Profile',
  }
);

Contract.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    terms: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('new', 'in_progress', 'terminated'),
      defaultValue: 'new',
    },
  },
  {
    sequelize,
    modelName: 'Contract',
    /**
     * We make 2 indexes for active contracts, one for the contractor and one for the client
     * I also assume they are unique since there should only be one contract per contractor and client
     * Setting unique: true helps performance a bit because the DB doesn't have to check for duplicates
     * We also include the other id because in some API calls we need only those 2 fields and the db could just pull
     * them from the index instead of searching for the row
     */
    indexes: [
      {
        name: 'in_progress_by_client',
        fields: ['ClientId', 'ContractorId', 'id'],
        unique: true,
        where: {
          status: 'in_progress',
        },
      },
      {
        name: 'in_progress_by_contractor',
        fields: ['ContractorId', 'ClientId', 'id'],
        unique: true,
        where: {
          status: 'in_progress',
        },
      },
    ],
  }
);

Job.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    price: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    paid: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    paymentDate: {
      type: Sequelize.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Job',
    /**
     *  We also create an index for the paymentDate that is sorted DESC, this is also unique
     *  because we include the id of the job in the index (otherwise we could have 2 jobs with the same paymentDate)
     */
    indexes: [
      {
        unique: true,
        fields: [
          {
            name: 'paymentDate',
            order: 'DESC',
          },
          'id',
        ],
      },
    ],
  }
);

Profile.hasMany(Contract, { as: 'Contractor', foreignKey: 'ContractorId' });
Contract.belongsTo(Profile, { as: 'Contractor' });
Profile.hasMany(Contract, { as: 'Client', foreignKey: 'ClientId' });
Contract.belongsTo(Profile, { as: 'Client' });
Contract.hasMany(Job);
Job.belongsTo(Contract);

export { sequelize, Profile, Contract, Job };
