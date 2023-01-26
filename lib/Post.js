const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");
const User = require("./User");

class Post extends Model {}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowsNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowsNull: false,
    },
    created_at: {
      type: DataTypes.STRING,
      allowsNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      references: {
        key: 'id',
        model: 'user'
      }
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: "post",
  }
);

Post.belongsTo(User, {
  foreignKey: 'created_by'
});

module.exports = Post;
