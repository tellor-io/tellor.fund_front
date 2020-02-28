import BootstrapTable from 'react-bootstrap-table-next';
import React, { Component }  from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

export const openProposalsTable = async (instance) =>{
  
    const columns = [{
          dataField: 'id',
          text: '',
          sort: true
        },
        {
          dataField: 'title',
          text: 'title'
        }, 
        {
          dataField: 'details',
          text: 'details'
        },
        {
          dataField: 'amount',
          text: 'amount'
        },
                {
          dataField: 'funded',
          text: '% funded'
        },
        {
          dataField: 'time',
          text: 'time left',

    }];

    var products = []
    var xx,hours,minutes,seconds,formattedTime
    var today = Math.round((new Date()).getTime() / 1000);
    try{
      await instance.methods.getAllOpenProposals().call().then(async function(res){
        for(var i=1;i<res.length;i++){
          await instance.methods.getProposalById(res[i]).call().then(function(res2){
            if(res2['6']){
            xx = new Date((res2['4']-today) * 1000)

                          // Get hours from the timestamp 
            hours = xx.getUTCHours(); 
  
            // Get minutes part from the timestamp 
            minutes = xx.getUTCMinutes(); 
  
            // Get seconds part from the timestamp 
            seconds = xx.getUTCSeconds(); 
  
            formattedTime = hours.toString().padStart(2, '0') + ':' + 
                minutes.toString().padStart(2, '0') + ':' + 
                seconds.toString().padStart(2, '0');


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
