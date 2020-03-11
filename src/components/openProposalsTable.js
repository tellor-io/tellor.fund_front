import BootstrapTable from 'react-bootstrap-table-next';
import React, { Component }  from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

export const openProposalsTable = async (instance) =>{
  
    const columns = [{
          dataField: 'id',
          text: '',
          sort: true,
          headerStyle: (colum, colIndex) => {
            return { width: '5%', textAlign: 'left' };
          }
        },
        {
          dataField: 'title',
          text: 'title',
        }, 
        {
          dataField: 'details',
          text: 'details',
        },
        {
          dataField: 'amount',
          text: 'amount',
          headerStyle: (colum, colIndex) => {
            return { width: '15%', textAlign: 'left' };
          }
        },
                {
          dataField: 'funded',
          text: '% funded',
          headerStyle: (colum, colIndex) => {
            return { width: '15%', textAlign: 'left' };
          }
        },
        {
          dataField: 'time',
          text: 'days left',
          headerStyle: (colum, colIndex) => {
            return { width: '10%', textAlign: 'left' };
          }

    }];

    var products = []
    var xx,hours,minutes,seconds,days,formattedTime
    var today = Math.round((new Date()).getTime() / 1000);
    try{
      await instance.methods.getAllOpenProposals().call().then(async function(res){
        for(var i=1;i<res.length;i++){
          await instance.methods.getProposalById(res[i]).call().then(function(res2){
            if(res2['6']){
            xx = new Date((res2['4']-today) * 1000)
            days = xx.getUTCDate()-1;
  
            formattedTime = days.toString().padStart(2,'0')

              products.push({
                id:res[i],
                title:res2['0'],
                details:res2['1'],
                amount:res2['3'],
                funded:res2['8'],
                time:formattedTime
              })
              console.log("Time : ",res['4'], today)
            }
          })
        }
      })
    }
    catch{
      console.log("no open proposals")
    }
    return (<BootstrapTable keyField='id' data={ products } columns={ columns } classes={ "bTable" } bordered={ false } rowClasses={ "bTableH" } striped/>)
}

;
