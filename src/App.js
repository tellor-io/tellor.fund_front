import React, { Component } from "react";
import TellorFund from "./contracts/TellorFund.json";
import Tellor from "./contracts/Tellor.json";
import getWeb3 from "./getWeb3";
import {openProposalsTable} from "./components/openProposalsTable"
import myProposalsTable from "./components/myProposalsTable"
import "./App.css";
import{ Button,
       Container,
       Modal,
       ModalHeader,
       ModalBody,
       ModalFooter } from "reactstrap";
import {
  EmailIcon,
  TelegramIcon,
  TwitterIcon
} from "react-share";

const contractAddress ="0x6BCA541fBDdb50d1c66272982Ab34E8cc850f349"//"0x7d67E614d92b9D070839954dfd82ceEc7daFDAeD";
console.log(contractAddress);

class MyModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: props.initialModalState
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  render() {
    return (
      <div>
        <img src="question.svg" onClick={this.toggle}/>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle} className="ModalH">Welcome to tellor.fund</ModalHeader>
          <ModalBody className="MyModal">
            <p>
              Tellor.fund is a smart contract interface to crowd fund community proposed initiatives.
            </p>
            <p><b>
              how it works
            </b></p>
            <ul>
              <li>
                Community members reach out to the Tellor team about something they’d like to propose.
              </li>
              <li> 
                Tellor team decided if it’s appropriate and then adds it to the list.
              </li>
              <li>
                TRB holders contribute funds to it.
              </li>
              <li>
                If an item reaches 100% funding then the TRB is released to Tellor to pay for that proposed activity.
              </li>
              <li>
                TRB is returned to the contributors if 100% is not reached.
              </li>
            </ul>
            <p>
              In order to fund a specific proposal, Type in the ID number and the amount of TRB you’d like to contribute and click fund.  This will trigger 2 transactions, one to allow tellor.fund to spend your TRB, and the other to send the funds.  
            </p>
            <p>
              Once you’ve contributed funds to an item you’ll see a record of it appear in the lower box.
            </p>
            <p>
              <b>*disclaimer*</b>
            </p>
            <p>
              This is not decentralized, upon reaching 100%, the money gets sent to the proposal creator and there is no recourse if they don't follow through with the proposal.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.toggle}>Close</Button>{' '}
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

class App extends Component {


  state = { web3: null,
            accounts: null,
            contract: null,
            openTable: null,
            myTable: null, 
            price: 0,
            contractAddress:contractAddress,
            tellorAddress:"",
            tellorInstance:null,
            availableBalance: 0,
            fundID:0,
            fundAmount:0,
            closeID:0,
            modal: false,
            errors:false
            };


  componentDidMount = async () => {
    this.handleCloseSubmit = this.handleCloseSubmit.bind(this);
    this.updateHandler = this.updateHandler.bind(this);
    this.handleWithdrawSubmit = this.handleWithdrawSubmit.bind(this);
    this.handleFundSubmit = this.handleFundSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const instance = await new web3.eth.Contract(TellorFund.abi,this.state.contractAddress);
      const availableBalance = web3.utils.fromWei(await instance.methods.getAvailableForWithdraw(accounts[0]).call());
      const price = await instance.methods.viewTellorPrice().call();
      const tellorAddress = await instance.methods.tellorAddress().call()
      const tellorInstance = await new web3.eth.Contract(Tellor.abi,tellorAddress);
      const openTable = await openProposalsTable(instance);
      const myTable = await myProposalsTable(instance,accounts[0]);
      await this.setState({web3,accounts,openTable,myTable,availableBalance,price,tellorAddress,tellorInstance,contract:instance})
      console.log(this.state.contract)
    } catch (error) {
      alert(
        `Failed to load web3, be sure to be connected to the right Metamask network`,
      );
      console.error(error);
    }

  };

  toggleModal() {
    console.log("hello");
    console.log( 'before setState: ', this.state );
    this.setState({
      modal: !this.state.modal
    })
    console.log( 'after setState: ', this.state );
  }
  updateHandler() {
      openProposalsTable(this.state.contract).then((res)=>{
        this.setState({openTable:res})
        myProposalsTable(this.state.contract,this.state.accounts[0])
      });
      myProposalsTable(this.state.contract,this.state.accounts[0]).then((res)=>{
        this.setState({myTable:res})
      });
  }



  handleChange(e,target) {
    let change = {}
    change[e.target.name] = e.target.value
    console.log("changing",e.target)
    this.setState(change)
  }
  handleCloseSubmit(event) {
    this.validateForm("close")
    if(this.state.errors){
      this.state.contract.methods.closeProposal(this.state.closeID).send({
            from: this.state.accounts[0],
            to: contractAddress,
            value:0,
            gasPrice: '20000000000' 
          }).then((res)=>{
            this.updateHandler()
            console.log("response: ", res)
      });
    }else{
      this.setState({errors:false})
      console.log("Error in Form Submission")
    }

  }
  handleWithdrawSubmit(event) {
    this.state.contract.methods.withdrawMoney().send({
          from: this.state.accounts[0],
          to: contractAddress,
          value:0,
          gasPrice: '20000000000' 
        }).then((res)=>{
          this.updateHandler()
          console.log("response: ", res)
    });
  }
  handleFundSubmit(event) {
      this.validateForm("fund")
    if(this.state.errors){
     this.state.tellorInstance.methods.approve(contractAddress,this.state.web3.utils.toWei(this.state.fundAmount)).send({
          from: this.state.accounts[0],
          to:this.state.tellorInstance._address,
          value:0,
          gasPrice: '20000000000' 
        }).once('receipt', (receipt) =>{
        console.log("approved",receipt)
       console.log("funding",this.state.fundID,this.state.fundAmount)
        this.state.contract.methods.fund(this.state.fundID,this.state.web3.utils.toWei(this.state.fundAmount)).send({
          from: this.state.accounts[0],
          to: contractAddress,
          value:0,
          gasPrice: '20000000000' 
        }).then((res)=>{
          this.updateHandler()
          console.log("response: ", res)
        });
      })
       }else{
      this.setState({errors:false})
      console.log("Error in Form Submission")
    }
  }

  validateForm(event){
    if(event="fund"){
      if(this.state.fundAmount < 1){
        this.setState({errors:true});
        alert('Fund amount must be >= 1')

      }
      else if (this.state.fundID ==0){
        this.setState({errors:true});
        alert('Fund ID must be > 0')
      }
    }else if(event="close"){
      if (this.state.closeID ==0){
        this.setState({errors:true});
        alert('Close ID must be > 0')
      }
    }
  }


  render() {
    if (!this.state.web3) {
      return <div>Loading tellor.fund</div>;
    }
    return (
      <div className="App">
        <link
          rel='stylesheet'
          href='https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.min.css'
        />
        <div className="HeaderContainer">
          <div className="Header">
            <div className="innerHeader">
               <h1 className="HText">
               <img className="Swoosh" src="./WhiteSwoosh.png" alt="TellorSwoosh"></img> 
               tellor.fund
               </h1>
            </div>
          </div>
        </div>
        <div>
        <div>
      </div>
        </div>
        <div className="PriceContainer">
          <div className ="Price">
            <h3> trb price : ${this.state.price} </h3>
          </div>
        </div>
        <div className="OpenTableContainer">
          <div className="MyTable">
          <div className="inner">
              {this.state.openTable}
            </div>
          </div>
        </div>
        <div className="FormContainer">
            <div className="ButtonContainer">
              <div className="Button1">
                <div className="question">
                              <MyModal initialModalState={true} className="MyModal"/>
              </div>
                <button onClick={this.handleFundSubmit}>fund</button>
                  <input type="number" placeholder="Proposal ID" name="fundID" onChange={this.handleChange}/>
                  <input type="number" placeholder="Amount TRB" name="fundAmount" onChange={this.handleChange}/>
              </div>
              <div className="Button">
                  <button onClick={this.handleCloseSubmit}>close</button>
                  <input type="number" name="closeID" placeholder="Proposal ID" onChange={this.handleChange}/>
              </div>
              <div className="Button"> 
                  <p><button onClick={this.handleWithdrawSubmit}>withdraw</button> {'\u00A0'} {this.state.availableBalance} TRB</p>
              </div>
              </div>
          </div>
        <div className="OpenTableContainer">
            <div className="MyTable">
              <div className="inner">
              {this.state.myTable}
            </div>
          </div>
        </div>
        <div className="SocialContainer">
          <div className="Social">
            <a href="https://twitter.com/wearetellor">
              <TwitterIcon size={32} round={true} />
            </a>
            <a href="https://t.me/tellorchannel">
              <TelegramIcon size={32} round={true} />
            </a>
            <a href="malito:info@tellor.io">
              <EmailIcon size={32} round={true} />
            </a>
        </div>
       </div>
    </div>
    );
  }
}

export default App;
