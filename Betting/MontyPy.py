from bayesian.bbn import build_bbn
import json

def f_prize_door(prize_door):
    d={"A":0.33, "B":0.33, "C":0.33}
    return d[prize_door]
            


def f_guest_door(guest_door):
    return 0.33


def f_monty_door(prize_door, guest_door, monty_door):
    if prize_door == guest_door:  # Guest was correct!
        if prize_door == monty_door:
            return 0     # Monty never reveals the prize
        else:
            return 0.5   # Monty can choose either goat door
    elif prize_door == monty_door:
        return 0         # Again, Monty wont reveal the prize
    elif guest_door == monty_door:
        return 0         # Monty will never choose the guest door
    else:
        # This covers all case where
        # the guest has *not* guessed
        # correctly and Monty chooses
        # the only remaining door that
        # wont reveal the prize.
        return 1


g = build_bbn(
        f_prize_door,
        f_guest_door,
        f_monty_door,
        domains=dict(
            prize_door=['A', 'B', 'C'],
            guest_door=['A', 'B', 'C'],
            monty_door=['A', 'B', 'C']))


def json_convert(query):
    """
    function used to convert queries into useful json files
    that can be served by bottle and imported into the game
    using ajax.
    """
    d={k[0]:{} for k in query.keys()}
    [d[k[0]].update({k[1]:r}) for k, r in query.items()]
    return json.dumps(d)

def dict_to_fun(dictionary):
    '''
    converts dictionaries to callables for unconditional distributions
    more complex code is needed for conditional function declarations
    '''
    return lambda x: dictionary[x]
