import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Event } from './event.entity';
import { Member } from './member.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  due_time: Date;

  @ManyToOne(() => Event, (event) => event.tasks, { onDelete: 'CASCADE' })
  event: Event;

  @ManyToMany(() => Member)
  @JoinTable()
  assigned_to: Member[];
}
