import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import {router} from './router';

Vue.use(Vuex);

const store = new Vuex.Store({
    state:{
        token:"",
        fbAPIKey: "AIzaSyBKtuE1NfkTfqVziABWRL3GAEHYhSf7mf4",
    },
    mutations:{
        setToken(state,token){
            state.token=token;
        },
        clearToken(state){
            state.token="";
        }
    },
    actions:{
        initAuth({commit,dispatch}){
            let token=localStorage.getItem("token");
            if(token){

                let expirationDate = localStorage.getItem("expirationDate");
                let time = new Date().getTime();
                console.log(time);
                if(time>=parseInt(expirationDate)){
                    console.log("token timeouted!");
                    dispatch("logout");
                }
                else{

                    commit("setToken",token);
                    let timerSecond = parseInt(expirationDate)-time;
                    dispatch("setTimeoutTimer",timerSecond);
                    router.push("/")
                }
            }
            else{
                router.push("/auth");
                return false;
            }
        },
        login({commit,dispatch,state},authData){
            let authLink = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=";
                
            if(authData.isUser){
                authLink ="https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=";

            }

            return axios.post(authLink+"AIzaSyBKtuE1NfkTfqVziABWRL3GAEHYhSf7mf4",
            {email:authData.email,password:authData.password,returnSecureToken:true})
            .then(response=>{
                commit("setToken",response.data.idToken);
                localStorage.setItem("token",response.data.idToken);
                localStorage.setItem("expirationDate",new Date().getTime()+parseInt(response.data.expiresIn)*1000);
                dispatch("setTimeoutTimer",parseInt(response.data.expiresIn)*1000);
            }).catch(e=>{
                console.log(e)
            })
        },
        logout({commit,dispatch,state}){
            commit("clearToken");
            localStorage.removeItem("token");
            localStorage.removeItem("expirationDate");
            router.replace("/auth");
        },
        setTimeoutTimer({dispatch},expiresIn){
            setTimeout(()=>{
                dispatch("logout");
            },expiresIn)
        }
    },
    getters:{
        isAuthenticated(state){
            return state.token!==""
        }
    }
})

export default store
