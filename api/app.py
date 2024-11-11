import time
import pickle
from flask import Flask, request
from board import ScrabbleBoard
import random

app = Flask(__name__)


@app.route('/time')
def get_current_time():
    return {'time': time.time()}

def build_trie(lexicon):
    num_nodes = 1
    trie = {0: {}}
    next_node = 1
    for word in lexicon:
        curr_node = 0
        for let in word:
            # if letter is present, move down its edge to next node
            if let in trie[curr_node]:
                edge_dict = trie[curr_node]
                curr_node = edge_dict[let]
            # otherwise, create new node and store its edge in current node
            # then move to it
            else:
                num_nodes += 1
                trie[next_node] = {}
                trie[curr_node][let] = next_node
                curr_node = next_node
                next_node += 1
        trie[curr_node]["END"] = True

    print(num_nodes)
    return trie

# Define a node to be stored in DAWG
class Node:
    next_id = 0

    def __init__(self):
        self.is_terminal = False
        self.id = Node.next_id
        Node.next_id += 1
        self.children = {}

    def __str__(self):
        out = [f"Node {self.id}\nChildren:\n"]
        letter_child_dict = self.children.items()
        for letter, child in letter_child_dict:
            out.append(f" {letter} -> {child.id}\n")
        return " ".join(out)

    def __repr__(self):
        out = []
        if self.is_terminal:
            out.append("1")
        else:
            out.append("0")
        for key, val in self.children.items():
            out.append(key)
            out.append(str(val.id))
        return "_".join(out)

    def __hash__(self):
        return self.__repr__().__hash__()

    def __eq__(self, other):
        return self.__repr__() == other.__repr__()

# returns length of common prefix
def length_common_prefix(prev_word, word):
    shared_prefix_length = 0
    for letter1, letter2 in (zip(prev_word, word)):
        if letter1 == letter2:
            shared_prefix_length += 1
        else:
            return shared_prefix_length
    return shared_prefix_length

# minimization function
def minimize(curr_node, common_prefix_length, minimized_nodes, non_minimized_nodes):
    # Start at end of the non_minimized_node list. Then minimize nodes until lengths of
    # non_min_nodes and common_prefix are equal.
    for _ in range(len(non_minimized_nodes), common_prefix_length, -1):

        parent, letter, child = non_minimized_nodes.pop()

        if child in minimized_nodes:
            parent.children[letter] = minimized_nodes[child]

        else:
            minimized_nodes[child] = child

        curr_node = parent

    return curr_node

# function to build dawg from given lexicon
def build_dawg(lexicon):
    root = Node()
    minimized_nodes = {root: root}
    non_minimized_nodes = []
    curr_node = root
    prev_word = ""
    for i, word in enumerate(lexicon):
        # get common prefix of new word and previous word
        common_prefix_length = length_common_prefix(prev_word, word)

        # minimization step: only call minimize if there are nodes in non_minimized_nodes
        if non_minimized_nodes:
            curr_node = minimize(curr_node, common_prefix_length, minimized_nodes, non_minimized_nodes)

        # adding new nodes after the common prefix
        for letter in word[common_prefix_length:]:
            next_node = Node()
            curr_node.children[letter] = next_node
            non_minimized_nodes.append((curr_node, letter, next_node))
            curr_node = next_node

        # by the end of this process, curr_node should always be a terminal node
        curr_node.is_terminal = True
        prev_word = word
        # if i % 1000 == 0:
        #     print(i)

    minimize(curr_node, 0, minimized_nodes, non_minimized_nodes)
    print(len(minimized_nodes))
    return root

@app.route('/dawg')
def get_more_time():
    text_file = open("lexicon/scrabble_words_complete.txt", "r")
    big_list = text_file.read().splitlines()
    text_file.close()

    build_trie(big_list)
    root = build_dawg(big_list)
    file_handler = open("lexicon/scrabble_words_complete.pickle", "wb")
    pickle.dump(root, file_handler)
    file_handler.close()
    return {'root': "root"}


# @app.route('/game')
# def get_more_timesss():
#     to_load = open("lexicon/scrabble_words_complete.pickle", "rb")
#     root = pickle.load(to_load)
#     game = ScrabbleBoard(root)
#     to_load.close()


#     tile_bag = ["A"] * 9 + ["B"] * 2 + ["C"] * 2 + ["D"] * 4 + ["E"] * 12 + ["F"] * 2 + ["G"] * 3 + \
#             ["H"] * 2 + ["I"] * 9 + ["J"] * 1 + ["K"] * 1 + ["L"] * 4 + ["M"] * 2 + ["N"] * 6 + \
#             ["O"] * 8 + ["P"] * 2 + ["Q"] * 1 + ["R"] * 6 + ["S"] * 4 + ["T"] * 6 + ["U"] * 4 + \
#             ["V"] * 2 + ["W"] * 2 + ["X"] * 1 + ["Y"] * 2 + ["Z"] * 1 + ["%"] * 2

#     word_rack = random.sample(tile_bag, 7)
#     [tile_bag.remove(letter) for letter in word_rack]
#     game = ScrabbleBoard(root)
#     result = game.get_start_move(word_rack)
#     return result


# @app.route('/blarg')
# def get_blarg():
#     board = [["","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","",""],["","","","","","","","","","","","","","",""]]
#     file_handler = open("lexicon/blarg.pickle", "wb")
#     pickle.dump(board, file_handler)
#     file_handler.close()

#     return {'hello': board}

# @app.route('/blarg2', methods = ['POST'])
# def get_blarg2():
#     to_load = open("lexicon/blarg.pickle", "rb")
#     board = pickle.load(to_load)
#     print(board)
#     to_load.close()

#     request_data = request.get_json()
#     row = request_data['row']
#     col = request_data['col']
#     letter = request_data['letter']

#     board[row][col] = letter

#     file_handler = open("lexicon/blarg.pickle", "wb")
#     pickle.dump(board, file_handler)
#     file_handler.close()

#     return {'hello': board}



@app.route('/start')
def start_game():
    # build dawg
    text_file = open("lexicon/scrabble_words_complete.txt", "r")
    big_list = text_file.read().splitlines()
    text_file.close()
    build_trie(big_list)
    root = build_dawg(big_list)
    file_handler = open("lexicon/scrabble_words_complete.pickle", "wb")
    pickle.dump(root, file_handler)
    file_handler.close()

    game = ScrabbleBoard(root)
    file_handler = open("lexicon/game.pickle", "wb")
    pickle.dump(game, file_handler)
    file_handler.close()

    return {'message': "started game"}

@app.route('/get-computer-first-move')
def computer_make_start_move():
    to_load = open("lexicon/game.pickle", "rb")
    game = pickle.load(to_load)
    result = game.get_start_move()
    return {'result': result}
