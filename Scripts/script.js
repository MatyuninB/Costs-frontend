let costs = [];
let summ = 0;
let date = new Date();

window.onload = async () => {
  await getCostsAPI();
  render();
  inputListener();
}

inputListener = () => {
  const inputWhere = document.querySelector('#where');
  const inputCost = document.querySelector('#cost');
  const sbmtNewCost = document.querySelector('#add');


  sbmtNewCost.addEventListener('click', async() => {
    let place = inputWhere.value;
    let cost = inputCost.value;

    if(place && cost) {
      let dateTmp = date.toLocaleString("ru", {day: 'numeric', month: 'numeric', year: 'numeric'});
      await addCostAPI(place, cost, dateTmp);

      inputCost.value = '';
      inputWhere.value  = '';
      inputWhere.focus();
    }
  });

  document.addEventListener('keydown', async(key) => {
    let place = inputWhere.value;
    let cost = inputCost.value;
   
    if(key.keyCode === 13 && place && cost) {
      let dateTmp = date.toLocaleString("ru", {day: 'numeric', month: 'numeric', year: 'numeric'});
      await addCostAPI(place, cost, dateTmp);

      inputCost.value = '';
      inputWhere.value  = '';
      inputWhere.focus();
    }
  });
}


render = () => {
  let currEdit = false;
  const container = document.querySelector('.waste');
  
  while(container.firstChild) {
    container.removeChild(container.firstChild);
  }

  costs.forEach( (elem, i) => {
    const content = document.createElement('div');
    const placeHTML = document.createElement('div');
    const costHTML = document.createElement ('div');
    const dateHTML  = document.createElement ('div');
    const editImg = document.createElement ('img');
    const trashImg = document.createElement ('img');
    const summHTML = document.querySelector('.total');
    const prefix = document.createElement('div');

    summHTML.innerText = `Итого: ${summ} руб.`;

    Object.assign(prefix, {
      innerText : `${i+1}.`,
      className : 'counter'
    });

    Object.assign(content, {
      className : 'costs',
      id: `costs${i}`
    });

    Object.assign(placeHTML, {
      className : "where",
      innerText : `${costs[i].shop}`,
      id: `shop${i}`,
    });

    Object.assign(costHTML, {
      className : "cost",
      innerText : `${costs[i].cost}р.`,
      id: `cost${i}`,
    });

    Object.assign(dateHTML,  {
      className : "date",
      innerText : costs[i].date,
      value: costs[i].date,
      id: `date${i}`
    });

    Object.assign(editImg,  {
      className : "icon editIcon",
      src: '../img/edit.png',
      id: `edit${i}`
    });

    Object.assign(trashImg,  {
      className : "icon",
      src: '../img/trash.png',
    });
   
    placeHTML.addEventListener('dblclick', () => {
      if(!currEdit) {
        currEdit = true;
        placeEdit(i);
      }
    });

    costHTML.addEventListener('dblclick', () => {
      if(!currEdit) {
        currEdit = true;
        costOfCostEdit(i);
      }
    }); 
    
    dateHTML.addEventListener('dblclick',  () => {
      if(!currEdit) {
        currEdit = true;
        dateEdit(i);
      }
    }); 

    content.appendChild(prefix);
    content.appendChild(placeHTML);
    content.appendChild(dateHTML);
    content.appendChild(costHTML);
    content.appendChild(editImg);
    content.appendChild(trashImg);

    trashImg.onclick = function () {
      deleteCost(i);
    }

    editImg.onclick = function () {
        if(!currEdit) 
          currEdit = true;
          editCost(i);
        }
    
    container.appendChild(content);
  });
}


deleteCost = (i) => {
  deleteCostAPI(costs[i]._id);
}

editCost = (i) => {
  let container = document.querySelector(`#costs${i}`);
  let doneButton = document.createElement('div');
  let costEdit = document.createElement('input'); 
  let shopEdit = document.createElement('input'); 
  let dataEdit = document.createElement('input');
  let currDate = document.querySelector(`#date${i}`) ;
  let currCost = document.querySelector(`#cost${i}`);
  let currShop = document.querySelector(`#shop${i}`);
  let editButton = document.querySelector(`#edit${i}`);

  Object.assign(dataEdit, {
    className: 'editInput',
    format: "DD MMMM YYYY",
    type: 'date',
    value: currDate.innerText.toString().split(' ').reverse().join('-')
  });

  Object.assign(costEdit, {
    className: 'editInput',
    type: 'number',
    value: parseInt(currCost.innerText)
  });

  Object.assign(shopEdit, {
    className: 'editInput',
    type: 'text',
    value: currShop.innerText
  });

  Object.assign(doneButton, {
    className: "done",
    innerText: "DONE",
  });

  container.replaceChild(shopEdit, currShop);
  container.replaceChild(dataEdit, currDate);
  container.replaceChild(costEdit, currCost);
  container.replaceChild(doneButton, editButton);

  doneButton.onclick = () => {
    let date = dataEdit.value.split('-').reverse().join(' ');
    
    currEdit = false;
    editCostAPI(costs[i]._id, shopEdit.value, costEdit.value, date);
  }

  document.addEventListener('keydown', async(key) => {
    let date = dataEdit.value.split('-').reverse().join(' ');
    if(key.keyCode === 13) {
      switch(document.activeElement) {
        case shopEdit:
          dataEdit.focus();
          break;
        case dataEdit:
          costEdit.focus();
          break;
        case costEdit:
          currEdit = false;
          editCostAPI(costs[i]._id, shopEdit.value, costEdit.value, date);
          break;
      }
    }
  });
}

placeEdit = (i) => {
  let editButton = document.querySelector(`#edit${i}`);
  let container = document.querySelector(`#costs${i}`);
  let shopEdit = document.createElement('input');
  let currShop = document.querySelector(`#shop${i}`); 
  let doneButton = document.createElement('div');
  let costEdit = document.getElementById(`costEd${i}`) || false;

  Object.assign(doneButton, {
    className: "done",
    innerText: "DONE",
  });

  Object.assign(shopEdit, {
    className: 'editInput',
    type: 'text',
    value: currShop.innerText,
    id: `shopEd${i}`
  });
  
  container.replaceChild(shopEdit, currShop);
  if(editButton) {
    container.replaceChild(doneButton, editButton);
  }

  shopEdit.focus();
 
  shopEdit.addEventListener('focusout', () => {
      editCostAPI(costs[i]._id, shopEdit.value, costs[i].cost, costs[i].date);
      currEdit = false;
  });

  shopEdit.addEventListener('keydown', async(key) => {
    let costEdit = document.getElementById(`costEd${i}`) || false;
      if(key.keyCode === 13) {
        editCostAPI(costs[i]._id, shopEdit.value, costs[i].cost, costs[i].date);
        currEdit = false;
      }
  });

  doneButton.onclick = function () {
      editCostAPI(costs[i]._id, shopEdit.value, costs[i].cost, costs[i].date);
      currEdit = false;  
    }
}

costOfCostEdit = (i) => {                             
  let editButton = document.querySelector(`#edit${i}`);
  let container = document.querySelector(`#costs${i}`);
  let costEdit = document.createElement('input'); 
  let currCost = document.querySelector(`#cost${i}`); 
  let doneButton = document.createElement('div');
  let shopEdit = document.getElementById(`shopEd${i}`) || false;

  Object.assign(doneButton, {
    className: "done",
    innerText: "DONE",
  });

  Object.assign(costEdit, {
    className: 'editInput',
    type: 'number',
    value: parseInt(currCost.innerText),
    id: `costEd${i}`
  });

    container.replaceChild(doneButton, editButton);
    container.replaceChild(costEdit, currCost);
    costEdit.focus();

    costEdit.addEventListener('keydown', async(key) => {
    if(key.keyCode === 13) {
      editCostAPI(costs[i]._id, costs[i].shop, costEdit.value, costs[i].date);
      currEdit = false;
    }
  });

  costEdit.addEventListener('focusout', () => {
    editCostAPI(costs[i]._id, costs[i].shop, costEdit.value, costs[i].date);
    currEdit = false;
  });

  doneButton.onclick = function () {
    editCostAPI(costs[i]._id, costs[i].shop, costEdit.value, costs[i].date);
    currEdit = false;
  }
}

dateEdit = (i) => {
  let editButton = document.querySelector(`#edit${i}`);
  let container = document.querySelector(`#costs${i}`);
  let doneButton = document.createElement('div');
  let dataEdit = document.createElement('input');
  let currDate = document.querySelector(`#date${i}`);

  Object.assign(doneButton, {
    className: "done",
    innerText: "DONE",
  });

  Object.assign(dataEdit, {
    timezone: 'ru',
    className: 'editInput',
    type: 'date',
    value: currDate.innerText.toString().split(' ').reverse().join('-')
  });

  container.replaceChild(dataEdit, currDate);
  container.replaceChild(doneButton, editButton);
  
  dataEdit.focus();
 
  dataEdit.addEventListener('focusout', () => {
    let date = dataEdit.value.split('-').reverse().join(' ');
    editCostAPI(costs[i]._id, costs[i].shop, costs[i].cost, date);
    currEdit = false;
  });

  dataEdit.addEventListener('keydown', async(key) => {
      if(key.keyCode === 13) {
        let date = dataEdit.value.split('-').reverse().join(' ');
        editCostAPI(costs[i]._id, costs[i].shop, costs[i].cost, date);
        currEdit = false;
      }
  });

  doneButton.onclick = function () {
      let date = dataEdit.value.split('-').reverse().join(' ');
      editCostAPI(costs[i]._id, costs[i].shop, costs[i].cost, date);
      currEdit = false;  
    }
}

// API's

getCostsAPI = async() => {
  let tmp  = await fetch('http://localhost:8000/allCosts', {method: "GET"})
  let result = await tmp.json();
  costs = result;
  
  await getSummAPI();

  render();
}

addCostAPI = async(shop, cost ,date) => {
  await fetch('http://localhost:8000/newCost', {
    method: 'POST',
    headers: {
      'content-type' : 'application/json',
    },
    body: JSON.stringify({
      "shop": shop,
      "date": date.split('.').join(' '),
      "cost": cost
    })
  });
  await getCostsAPI();
}

deleteCostAPI = async(id) => {
  await fetch('http://localhost:8000/costDelete', {
    method: 'DELETE',
    headers: {
      'Content-Type' : 'application/json',
    },
    body: JSON.stringify({
      '_id' : id,
    }),
  });
  await getSummAPI();
  await getCostsAPI();
}

editCostAPI = async(id, shop, cost, date) => {
  await fetch('http://localhost:8000/editCost', {
    method: 'PATCH',
    headers: {
      'Content-Type' : 'application/json',
    },
    body: JSON.stringify({
      "_id" : id,
      "date": date,
      "shop": shop,
      "cost": cost
    })
  });
  await getCostsAPI();
}

getSummAPI = async() => {
  summ = await (await fetch('http://localhost:8000/summCost')).json();
  render()
}