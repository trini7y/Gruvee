import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Task } from './task.entity';
import { Member } from './member.entity';
import { User } from './users.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp' })
  end_time: Date;

  @ManyToOne(() => User, (user) => user.events, { eager: true })
  created_by: User;

  @OneToMany(() => Task, (task) => task.event)
  tasks: Task[];

  @OneToMany(() => Member, (member) => member.event, { cascade: true })
  members: Member[];
}
