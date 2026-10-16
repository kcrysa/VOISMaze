import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'start_date' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate!: Date | null;

  /**
   * null = in progress
   * 1    = won
   * 0    = aborted
   */
  @Column({ type: 'smallint', nullable: true })
  won!: number | null;

  /** Elapsed seconds at end of game */
  @Column({ name: 'elapsed_time', type: 'integer', nullable: true })
  elapsedTime!: number | null;
}
