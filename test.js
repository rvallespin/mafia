//Set root level. Il Capo di Capei
var mafia = new Mafia("Al Capone",40);

//Set boss level 1
var luciano = new Mobster("Luciano", 21);
mafia.root.addMember(luciano);

//Set level 1 subordinate. Belongs to luciano
var meyer = new Mobster("Meyer", 24);
luciano.addMember(meyer);

//Set level 1 subordinate. Belongs to luciano
var siegel = new Mobster("Siegel", 22);
luciano.addMember(siegel);

//Set boss level 1
var anastasia = new Mobster("Anastasia", 35);
mafia.root.addMember(anastasia);

//Set level 1 subordinate. Belongs to anastasia
var adonis = new Mobster("Adonis", 22);
anastasia.addMember(adonis);

//Set level 2 subordinate. Belongs to adonis and anastasia
var torio = new Mobster("Torio", 10);
adonis.addMember(torio);

function rePrintOrganization(mafia){
  $("#mafiaRepresentation").html("");
  printOrganization(mafia.root, $("#mafiaRepresentation"));
}
function printOrganization(member, currentContainer){
  var newContainer = $("<div rel='"+member.id+"'>"+member.id+" ("+member.age+"/"+member.getLevel()+")</div>");
  currentContainer.append(newContainer);
  for(var i = 0;i<member.subordinates.length;i++)
    printOrganization(member.subordinates[i], newContainer);
}

$(function(){
  rePrintOrganization(mafia);
  $("#putInPrison").click(function(){
    mafia.putInJail(mafia.root.findById("Luciano"));
    rePrintOrganization(mafia);
  });

  $("#releaseFromPrison").click(function(){
    mafia.backFromJail(mafia.jail.pop());
    rePrintOrganization(mafia);
  });
});
