import { $, $$, appendTo, createElement } from './dom-utils'
import { getFile, setFile } from './form-util'

export async function getInputsMap (formInputs) {
  let map = {};

  await Promise.all(formInputs.map(async (input) => {
    let id = input.id;
    let value;
    let type = input.type;

    switch(type) {
      case "checkbox":
        value = input.checked;
        break;
      case "file":
        value = await getFile(input);
        break;
      default:
        value = input.value;
        break;
    }

    map[id] = {
      // "id": id,
      "value": value,
      // "type": type,
    };
  }));

  return map;
}

export async function restoreInputsMap (formInputs, map) {
  if (!map) {
    return false;
  }

  formInputs.forEach((input) => {
    let id = input.id;
    let item = map[id];

    if (item) {
      let value = item["value"];
      let type = item["type"];

      // Make it's the same input type as when we saved
      if (!type || type == input.type) {
        switch(input.type) {
          case "checkbox":
            input.checked = value;
            break;
          case "date":
          case "time":
            // Do not restore those fields
            break;
          case "file":
            setFile(input, value);
            break;
          default:
            input.value = value;
            break;
        }
      }
    }
  });
}

export function browserSave(key, data) {
  const dataString = JSON.stringify(data);
  window.location.hash = "#" + dataString;

  if (typeof(Storage) !== "undefined") {
    localStorage.setItem(key, dataString);
  }
  return true;
}

export function browserGet(key) {
  let itemString  = window.location.hash;
  try {
    itemString = decodeURI(itemString.replace("#", ""));
    return JSON.parse(itemString);
  } catch(e) {
    console.error("Error while deserializing saved item", e);
  }

  if (typeof(Storage) !== "undefined") {
    let itemString  = localStorage.getItem(key);
    if (itemString) {
      try {
        return JSON.parse(itemString);
      } catch(e) {
        console.error("Error while deserializing saved item", e);
      }
    }
  }

  return null;
}


export async function handleSave () {
    const form = $('#form-profile');
    const formInputs = $$('#form-profile input');
    const autogenerate = $('#autogenerate');
    const signature = $('#signature');
    const savebar = $('#savebar')
    const profile = "default";
    const mapKey = profile + "_map";
    const generateButton = $('#generate-btn');

    formInputs.push(autogenerate);
    formInputs.push(signature);

    const existingMap = browserGet(mapKey);
    if (existingMap) {
      await restoreInputsMap(formInputs, existingMap);
      if (autogenerate.checked) {
        generateButton.click();
      }
    }

    $('#save-btn').addEventListener('click', async (event) => {
        event.preventDefault();

        const map = await getInputsMap(formInputs);
        if (browserSave(mapKey, map)) {
          savebar.classList.remove('d-none')
          setTimeout(() => savebar.classList.add('show'), 100)

          setTimeout(function () {
            savebar.classList.remove('show')
            setTimeout(() => savebar.classList.add('d-none'), 500)
          }, 6000)
        }

        return;
    });


}
