import React, { useEffect, useState } from 'react'
import userServices from '../../../../Services/UserService'; // Adjust the path as needed
import DailyTraffic from '../default/components/DailyTraffic';
import PieChartCard from '../default/components/PieChartCard';
import StatiqueEvent from 'backoffice/views/events/components/StatiqueEvent';
import StatisticResources from '../resources/StatisticResources';
import PsychologistStatsPieChart from './components/PsychologistStatsPieChart';
import TestParticipationPieChart from './components/TestParticipationPieChart';

//ressource



const DashboardA = () => {
      const [users, setUsers] = useState([]);
      const [showPending, setShowPending] = useState(false); // Track the current view
    
      const fetchDataUsers = async () => {
        try {      
          if(showPending){
            setUsers([]);
            const data = await userServices.GetPendingRequests()
            if(data.users && data.users.length>0){
              setUsers(data.users);
            }
            else{
              setUsers([]);
              setShowPending(false); 
            }
          }  
          else{
            const data = await userServices.getAllUsers()
            setUsers(data.users);
          }
    
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };

        useEffect(() => {
          fetchDataUsers();
        }, [showPending]); 

  return (
    <div>
        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2 mb-10">
            <DailyTraffic />
            <PieChartCard tableData={users} />
            <PsychologistStatsPieChart/>
            <TestParticipationPieChart />
            <StatisticResources/>
            <StatiqueEvent/>
        </div>



    </div>
  )
}

export default DashboardA
