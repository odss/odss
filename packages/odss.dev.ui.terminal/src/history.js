
export default class History{
    constructor(){
        var list = [];
        var position = 0;
        this.add = function(value) {
            if (list.length === 0 || list[list.length - 1] !== value) {
                list.push(value);
                position = list.length - 1;
            }
        };
        this.next = function() {
            return position < list.length - 1 ? list[++position] : null;
        };
        this.prev = function() {
            return position >= 0 ? list[position--] : null;
        };
    }
}
