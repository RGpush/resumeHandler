const Validator = require('validator');
const isEmpty = require('./is-Empty');


module.exports = function validateExperienceInput(data){
    let errors = {} ;

    data.title = !isEmpty(data.title) ? data.title:'';
    data.company = !isEmpty(data.company) ? data.company:'';
    data.location = !isEmpty(data.location) ? data.location:'';
    data.from = !isEmpty(data.from) ? data.from:'';
    data.to = !isEmpty(data.to) ? data.to:'';
    data.current = !isEmpty(data.current) ? data.current:'';




    if(!Validator.isEmpty(data.title)){
        errors.title = 'Job title field is required';
    }

    if(!Validator.isEmpty(data.company)){
        errors.company = 'Company field is required';
    }

    if(!Validator.isEmpty(data.location)){
        errors.location = 'Job location field is required';
    }

    if(!Validator.isEmpty(data.from)){
        errors.from = 'From date field is required';
    }

    if(Validator.isEmpty(data.to)){
        errors.to = 'To date field is required';
    }

    if(Validator.isEmpty(data.current)){
        errors.current = 'Current field is required';
    }

    return {
        errors,
        isValid : isEmpty(errors)
    }
}