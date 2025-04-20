import Users from "./Users.model.js";
import Friends from "./Friends.model.js";
import Messages from "./Messages.model.js";
import File from "./File.model.js";
import Groups from "./Group.model.js";
import Group_Members from "./Group_Members.model.js";

// belongsTo → One-to-One or Many-to-One (this model has the foreign key)
// hasOne → One-to-One (the other model has the foreign key)
// hasMany → One-to-Many (the other model has the foreign key)
// belongsToMany → Many-to-Many (through a junction table)

Users.hasMany(Friends, { foreignKey: 'user_id', as: 'sentRequests', onDelete: 'CASCADE' });
Users.hasMany(Friends, { foreignKey: 'friend_id', as: 'receivedRequests', onDelete: 'CASCADE' });
Users.hasMany(Group_Members, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Users.hasMany(Groups, { foreignKey: 'admin_id', as: 'administeredGroups', onDelete: 'CASCADE' });

Friends.belongsTo(Users, { foreignKey: 'user_id', as: 'User', onDelete: 'CASCADE' });
Friends.belongsTo(Users, { foreignKey: 'friend_id', as: 'Friend', onDelete: 'CASCADE' });

Messages.belongsTo(Users, { foreignKey: 'sender_id', as: 'sender', onDelete: 'CASCADE' });
Messages.belongsTo(Users, { foreignKey: 'receiver_id', as: 'sender', onDelete: 'CASCADE' });
Messages.belongsTo(Groups, { foreignKey: 'group_id', as: 'group_id', onDelete: 'CASCADE'});

Groups.belongsTo(Users, { foreignKey: 'admin_id', as: 'admin', onDelete: 'CASCADE' });

Group_Members.belongsTo(Groups, { foreignKey: 'group_id' });  
Group_Members.belongsTo(Users, { foreignKey: 'user_id' });



