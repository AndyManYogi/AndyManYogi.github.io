/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function startSimulation(time, numberOfTwentys, numberOfTens, maxWithdrawal, 
                            serviceFee) {

    const sim = new Simulation(time) ;
    
    const atmMachine = new ATM(numberOfTwentys, numberOfTens, 
                                maxWithdrawal, serviceFee, sim) ;
    
    return main = {sim, atmMachine} ;
}
