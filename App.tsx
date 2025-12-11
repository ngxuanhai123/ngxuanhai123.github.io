import React from 'react';
import MainContent from './components/MainContent';
import SnowFall from './components/SnowFall';
import HolidayIntro from './components/HolidayIntro';
import { isHolidaySeason } from './utils/holiday';

const App: React.FC = () => {
  const isHoliday = isHolidaySeason();

  return (
    <>
      {isHoliday && <SnowFall />}
      {isHoliday && <HolidayIntro />}
      <MainContent />
    </>
  );
};

export default App;