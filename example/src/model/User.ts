import {Table, Column, Model} from 'sequelize-typescript';

@Table
export class User extends Model<User> {
    @Column
    name: string;
    @Column
    birthday: Date;

    public async post() {
        await User.sync();
        return await this.save();
    }
}