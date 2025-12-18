float getFaderValue(int index){
    if(index == 0){
        return u_faderValues[0];
    }
    else if(index == 1){
        return u_faderValues[1];
    }
    else if(index == 2){
        return u_faderValues[2];
    }
    else if(index == 3){
        return u_faderValues[3];
    }
    else if(index == 4){
        return u_faderValues[4];
    }
    else if(index == 5){
        return u_faderValues[5];
    }
    else if(index == 6){
        return u_faderValues[6];
    }
    else if(index == 7){
        return u_faderValues[7];
    }
    else if(index == 8){
        return u_faderValues[8];
    }
    else{
        return 0.0;
    }
}