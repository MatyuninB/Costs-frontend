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
      await addCostAPI(place, cost, date.toLocaleString("ru", {day: 'numeric', month: 'numeric', year: 'numeric'}));

      inputCost.value = '';
      inputWhere.value  = '';
    }
  });

  document.addEventListener('keydown', async(key) => {
    let place = inputWhere.value;
    let cost = inputCost.value;
   
    if(key.keyCode === 13 && place && cost) {
      await addCostAPI(place, cost, date.toLocaleString("ru", {day: 'numeric', month: 'numeric', year: 'numeric'}));

      inputCost.value = '';
      inputWhere.value  = '';
    }
  });
}

    

render = () => {
  const container = document.querySelector('.waste')
  
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
    const summHTML = document.querySelector('.total')
    const prefix = document.createElement('div');

    summHTML.innerText = `Итого: ${summ} руб.`;

    Object.assign(prefix, {
      innerText : `${i+1}.`,
      className : 'counter'
    });
    Object.assign(content, {
      className : 'costs',
      id: `costs${i}`
    }) ;
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
      editCost(i);
    }
    container.appendChild(content)
  });
}


deleteCost = (i) => {
  deleteCostAPI(costs[i]._id);
}

editCost = (i) => {
  let container = document.querySelector(`#costs${i}`)
  let doneButton = document.createElement('div');
  let costEdit = document.createElement('input'); 
  let shopEdit = document.createElement('input'); 
  let dataEdit = document.createElement('input');
  let currCost = document.querySelector(`#cost${i}`);
  let currShop = document.querySelector(`#shop${i}`);
  let currDate = document.querySelector(`#date${i}`) 
  let editButton = document.querySelector(`#edit${i}`)

  

  Object.assign(dataEdit, {
    className: 'editInput',
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
  })

  container.replaceChild(shopEdit, currShop);
  container.replaceChild(dataEdit, currDate);
  container.replaceChild(costEdit, currCost);
  container.replaceChild(doneButton, editButton);

  doneButton.onclick = function () {
    let date = dataEdit.value.split('-').reverse().join(' ');
    editCostAPI(costs[i]._id, shopEdit.value, costEdit.value, date);
  }
  document.addEventListener('keydown', async(key) => {
    if(key.keyCode === 13) {
      let date = dataEdit.value.split('-').reverse().join(' ');
      editCostAPI(costs[i]._id, shopEdit.value, costEdit.value, date);
    }
  });
}

// sortByDate = () => {
//   costs.sort( (a, b) => {a > b? 1 : -1});
// }

// API's

getCostsAPI = async() => {
  let tmp  = await fetch('http://localhost:8000/allCosts', {method: "GET"})
  let result = await tmp.json();
  costs = result;
  
  await getSummAPI();
  // sortByDate();

  render();
}

addCostAPI = async(shop, cost ,date) => {
  console.log(date)
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
  console.log(date)
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