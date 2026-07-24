import { GMProfile } from '../types';

export const GM_PROFILES: GMProfile[] = [
  {
    id: 'howie-roseman',
    name: 'Howie Roseman',
    title: 'Executive VP of Football Operations / GM',
    tenures: [{ teamId: 'PHI', startYear: 2010, endYear: null }],
    picks: [
      { year: 2010, round: 1, overallPick: 13, playerName: 'Brandon Graham', position: 'EDGE', rawPosition: 'DE', college: 'Michigan', teamId: 'PHI' },
      { year: 2010, round: 2, overallPick: 37, playerName: 'Nate Allen', position: 'S', rawPosition: 'DB', college: 'South Florida', teamId: 'PHI' },
      { year: 2010, round: 3, overallPick: 86, playerName: "Daniel Te'o-Nesheim", position: 'EDGE', rawPosition: 'DE', college: 'Washington', teamId: 'PHI' },
      { year: 2011, round: 1, overallPick: 23, playerName: 'Danny Watkins', position: 'IOL', rawPosition: 'G', college: 'Baylor', teamId: 'PHI' },
      { year: 2011, round: 6, overallPick: 191, playerName: 'Jason Kelce', position: 'IOL', rawPosition: 'C', college: 'Cincinnati', teamId: 'PHI' },
      { year: 2012, round: 1, overallPick: 12, playerName: 'Fletcher Cox', position: 'DT', rawPosition: 'DT', college: 'Mississippi St.', teamId: 'PHI' },
      { year: 2012, round: 3, overallPick: 88, playerName: 'Nick Foles', position: 'QB', rawPosition: 'QB', college: 'Arizona', teamId: 'PHI' },
      { year: 2013, round: 1, overallPick: 4, playerName: 'Lane Johnson', position: 'OT', rawPosition: 'T', college: 'Oklahoma', teamId: 'PHI' },
      { year: 2013, round: 2, overallPick: 35, playerName: 'Zach Ertz', position: 'TE', rawPosition: 'TE', college: 'Stanford', teamId: 'PHI' },
      { year: 2016, round: 1, overallPick: 2, playerName: 'Carson Wentz', position: 'QB', rawPosition: 'QB', college: 'North Dakota St.', teamId: 'PHI' },
      { year: 2018, round: 7, overallPick: 233, playerName: 'Jordan Mailata', position: 'OT', rawPosition: 'T', college: '', teamId: 'PHI' },
      { year: 2020, round: 2, overallPick: 53, playerName: 'Jalen Hurts', position: 'QB', rawPosition: 'QB', college: 'Oklahoma', teamId: 'PHI' },
      { year: 2021, round: 1, overallPick: 10, playerName: 'DeVonta Smith', position: 'WR', rawPosition: 'WR', college: 'Alabama', teamId: 'PHI' },
      { year: 2022, round: 1, overallPick: 13, playerName: 'Jordan Davis', position: 'DT', rawPosition: 'DT', college: 'Georgia', teamId: 'PHI' },
      { year: 2023, round: 1, overallPick: 9, playerName: 'Jalen Carter', position: 'DT', rawPosition: 'DL', college: 'Georgia', teamId: 'PHI' },
      { year: 2023, round: 1, overallPick: 30, playerName: 'Nolan Smith', position: 'EDGE', rawPosition: 'OLB', college: 'Georgia', teamId: 'PHI' },
      { year: 2024, round: 1, overallPick: 22, playerName: 'Quinyon Mitchell', position: 'CB', rawPosition: 'CB', college: 'Toledo', teamId: 'PHI' },
      { year: 2024, round: 2, overallPick: 40, playerName: 'Cooper DeJean', position: 'CB', rawPosition: 'DB', college: 'Iowa', teamId: 'PHI' }
    ],
  },
  {
    id: 'joe-schoen',
    name: 'Joe Schoen',
    title: 'General Manager',
    tenures: [{ teamId: 'NYG', startYear: 2022, endYear: null }],
    picks: [
      { year: 2022, round: 1, overallPick: 5, playerName: 'Kayvon Thibodeaux', position: 'EDGE', rawPosition: 'DE', college: 'Oregon', teamId: 'NYG' },
      { year: 2022, round: 1, overallPick: 7, playerName: 'Evan Neal', position: 'OT', rawPosition: 'T', college: 'Alabama', teamId: 'NYG' },
      { year: 2022, round: 2, overallPick: 43, playerName: 'Wan\'Dale Robinson', position: 'WR', rawPosition: 'WR', college: 'Kentucky', teamId: 'NYG' },
      { year: 2022, round: 3, overallPick: 67, playerName: 'Joshua Ezeudu', position: 'IOL', rawPosition: 'G', college: 'North Carolina', teamId: 'NYG' },
      { year: 2023, round: 1, overallPick: 24, playerName: 'Deonte Banks', position: 'CB', rawPosition: 'CB', college: 'Maryland', teamId: 'NYG' },
      { year: 2023, round: 2, overallPick: 57, playerName: 'John Michael Schmitz', position: 'IOL', rawPosition: 'C', college: 'Minnesota', teamId: 'NYG' },
      { year: 2023, round: 3, overallPick: 73, playerName: 'Jalin Hyatt', position: 'WR', rawPosition: 'WR', college: 'Tennessee', teamId: 'NYG' },
      { year: 2024, round: 1, overallPick: 6, playerName: 'Malik Nabers', position: 'WR', rawPosition: 'WR', college: 'LSU', teamId: 'NYG' },
      { year: 2024, round: 2, overallPick: 47, playerName: 'Tyler Nubin', position: 'S', rawPosition: 'S', college: 'Minnesota', teamId: 'NYG' },
      { year: 2024, round: 3, overallPick: 70, playerName: 'Andru Phillips', position: 'CB', rawPosition: 'CB', college: 'Kentucky', teamId: 'NYG' }
    ],
  },
  {
    id: 'trent-baalke',
    name: 'Trent Baalke',
    title: 'General Manager',
    tenures: [
      { teamId: 'SF', startYear: 2011, endYear: 2016 },
      { teamId: 'JAX', startYear: 2021, endYear: null },
    ],
    picks: [
      { year: 2011, round: 1, overallPick: 7, playerName: 'Aldon Smith', position: 'EDGE', rawPosition: 'DE', college: 'Missouri', teamId: 'SF' },
      { year: 2011, round: 2, overallPick: 36, playerName: 'Colin Kaepernick', position: 'QB', rawPosition: 'QB', college: 'Nevada', teamId: 'SF' },
      { year: 2012, round: 1, overallPick: 30, playerName: 'A.J. Jenkins', position: 'WR', rawPosition: 'WR', college: 'Illinois', teamId: 'SF' },
      { year: 2013, round: 1, overallPick: 18, playerName: 'Eric Reid', position: 'S', rawPosition: 'S', college: 'LSU', teamId: 'SF' },
      { year: 2014, round: 1, overallPick: 30, playerName: 'Jimmie Ward', position: 'CB', rawPosition: 'DB', college: 'Northern Illinois', teamId: 'SF' },
      { year: 2015, round: 1, overallPick: 17, playerName: 'Arik Armstead', position: 'DT', rawPosition: 'DT', college: 'Oregon', teamId: 'SF' },
      { year: 2016, round: 1, overallPick: 7, playerName: 'DeForest Buckner', position: 'DT', rawPosition: 'DT', college: 'Oregon', teamId: 'SF' },
      { year: 2021, round: 1, overallPick: 1, playerName: 'Trevor Lawrence', position: 'QB', rawPosition: 'QB', college: 'Clemson', teamId: 'JAX' },
      { year: 2021, round: 1, overallPick: 25, playerName: 'Travis Etienne', position: 'RB', rawPosition: 'RB', college: 'Clemson', teamId: 'JAX' },
      { year: 2022, round: 1, overallPick: 1, playerName: 'Travon Walker', position: 'EDGE', rawPosition: 'DE', college: 'Georgia', teamId: 'JAX' },
      { year: 2022, round: 1, overallPick: 27, playerName: 'Devin Lloyd', position: 'LB', rawPosition: 'LB', college: 'Utah', teamId: 'JAX' },
      { year: 2023, round: 1, overallPick: 27, playerName: 'Anton Harrison', position: 'OT', rawPosition: 'T', college: 'Oklahoma', teamId: 'JAX' },
      { year: 2024, round: 1, overallPick: 23, playerName: 'Brian Thomas Jr.', position: 'WR', rawPosition: 'WR', college: 'LSU', teamId: 'JAX' }
    ],
  },
];