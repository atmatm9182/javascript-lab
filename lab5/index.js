const asyncAdd = async (a, b) => {
    if (typeof a !== "number" || typeof b !== "number") {
        return Promise.reject("Argumenty muszą mieć typ number!");
    }
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(a + b);
        }, 100);
    });
};

async function asyncAddMany(counter, nums) {
    if (nums.length == 1) return [nums[0], counter];

    const promises = [];
    for (let i = 0; i < nums.length - 1; i += 2) {
        promises.push(asyncAdd(nums[i], nums[i + 1]));
    }

    if (nums.length % 2 != 0)
        promises.push(Promise.resolve(nums[nums.length - 1]));

    const results = await Promise.all(promises);
    return asyncAddMany(counter + 1, results);
}

const data = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];

async function timeExecution(func, ...args) {
    performance.mark("start");
    const result = await func.apply(undefined, args);

    console.log(performance.measure("start"));
    return result;
}

timeExecution(asyncAddMany, 0, data);
