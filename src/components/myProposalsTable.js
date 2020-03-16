import BootstrapTable from 'react-bootstrap-table-next';
import React, { Component }  from 'react';


export const myProposalsTable = async (instance,myAddress) =>{
      // Modern dapp browsers...
		const columns = [
        {dataField: 'uID',
        hidden:true
      },
        {
          dataField: 'id',
		      text: 'my ids'
		    },
		    {
		      dataField: 'title',
		      text: 'title'
		    },
        {
          dataField: 'amount',
          text: 'my funds'
        }, {
		      dataField: 'funded',
		      text: '% funded'
		    }];

         var products = []
    try{
      var today = Math.round((new Date()).getTime() / 1000);
      await instance.methods.getProposalsByAddress(myAddress).call().then(async function(res){
      console.log("My Prop",res)
      for(var i=0;i<res['0'].length;i++){
        await instance.methods.getProposalById(res['0'][i]).call().then(function(res2){
              products.push({
                uID:i,
                id:res['0'][i],
                title:res2['0'],
                amount:res['1'][i]/1000000000000000000,
                funded:res2['8']
              })
        })
      }
      })
    }
    catch{
      console.log("you have no proposals")
    }
		return(<BootstrapTable keyField='uID' data={ products } columns={ columns } classes={ "bTable" } bordered={ false } striped/>)
  };






export default myProposalsTable
 