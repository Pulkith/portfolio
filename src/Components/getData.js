import { $ } from './Imports';

const getData = (key, f) => {
    $.getJSON("./data.json", function(json) {
        f(json[key].filter(e => (!(e["template"]))))
    })
}

export default getData